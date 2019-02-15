import * as fs from 'fs';
import * as uuid from 'uuid';
import * as path from 'path';
import { Context, Controller } from 'egg';
import { CallData } from 'egg-typed-tracking';
import { SceneTestBase, ReqTestBase, SceneData, TestReqData } from '../../test/base';
import { route } from 'egg-controller';
import { BadRequestError, NotFoundError } from 'egg-controller/error';
import { getTrackingMetadata } from '..';
import { ReqTest } from '../../test/req_test';

export class TestController {

  private config: {
    basePath: string;
    /** 跟踪数据保存黑名单 */
    trackingSaveBlackList: RegExp[]
    /** 跟踪数据保存白名单 */
    trackingSaveWhiteList: RegExp[]
  };

  private readonly sceneRootDir: string;

  constructor(ctx: Context) {
    this.config = (ctx.app.config as any).et.sceneTest;
    this.sceneRootDir = path.join(ctx.app.baseDir, this.config.basePath);
    this.mkdir(this.sceneRootDir);
  }

  getSceneTest(id: string) {
    return new SceneTestBase(path.join(this.sceneRootDir, id));
  }

  getReqTestPath(sid: string, rid: string) {
    return path.join(this.sceneRootDir, sid, rid);
  }

  getReqTest(sid: string, rid: string) {
    return new ReqTestBase(this.getReqTestPath(sid, rid));
  }

  @route({
    url: config => `${(config as any).et.metaPath}/test/scene`,
    name: '获取测试场景', noTracking: true
  })
  getSceneList() {
    return fs.readdirSync(this.sceneRootDir)
      .map(id => {
        return this.getSceneTest(id).info;
      })
      .filter(info => info);
  }

  @route({
    url: config => `${(config as any).et.metaPath}/test/scene/:id`,
    name: '获取测试场景详情', noTracking: true
  })
  getScene(id: string) {
    const scene = this.getSceneTest(id);
    return {
      ...scene.info,
      req: scene.testReq.map(req => req.info),
    };
  }

  @route({
    url: config => `${(config as any).et.metaPath}/test/scene`,
    method: 'post', name: '添加测试场景', noTracking: true
  })
  addScene(id: string, title: string) {
    const scene = this.getSceneTest(id);
    scene.info = {
      id, title, req: []
    };
    scene.saveInfo();
    return true;
  }

  @route({
    url: config => `${(config as any).et.metaPath}/test/scene/:id`,
    method: 'delete', name: '删除测试场景', noTracking: true
  })
  removeScene(id: string) {
    this.getSceneTest(id).remove();
  }

  @route({
    url: config => `${(config as any).et.metaPath}/test/scene/:id`,
    method: 'put', name: '更新测试场景', noTracking: true
  })
  saveScene(id: string, data: SceneData) {
    const scene = this.getSceneTest(id);
    scene.info = data;
    scene.saveInfo();
    return this.getScene(data.id);
  }

  @route({
    url: config => `${(config as any).et.metaPath}/test/scene/req`,
    name: '获取测试场景请求列表', noTracking: true
  })
  getSceneCase(id: string) {
    return this.getSceneTest(id).testReq.map(req => req.info);
  }

  @route({
    url: config => `${(config as any).et.metaPath}/test/scene/:id/req`,
    method: 'post', name: '添加测试场景请求', noTracking: true
  })
  createSceneReq(id: string, data: TestReqData = {} as TestReqData) {
    const sceneTest = this.getSceneTest(id);

    data.id = uuid.v4();
    const reqTest = this.getReqTest(id, data.id);
    reqTest.info = data;
    reqTest.saveInfo();

    if (!sceneTest.info.req) {
      sceneTest.info.req = [];
    }
    sceneTest.info.req.push(data.id);
    sceneTest.saveInfo();

    return this.getScene(id);
  }

  @route({
    url: config => `${(config as any).et.metaPath}/test/scene/:id/req/:rid`,
    method: 'delete', name: '删除测试场景请求', noTracking: true
  })
  removeSceneReq(id: string, rid: string) {
    this.getReqTest(id, rid).remove();
  }

  @route({
    url: config => `${(config as any).et.metaPath}/test/scene/:id/reqByTracking`,
    method: 'post', name: '使用跟踪数据添加测试场景请求', noTracking: true
  })
  createSceneReqByTracking(id: string, tid: number, title: string) {
    const trackingData = getTrackingMetadata().find(t => t.id === tid);
    if (!trackingData) {
      throw new BadRequestError('未找到跟踪数据');
    }

    const sceneTest = this.getSceneTest(id);
    if (!sceneTest) {
      throw new NotFoundError('未找到测试场景');
    }

    // 数据修剪
    const header = {
      ...trackingData.extInfo.header,
    };
    delete header['content-length'];

    const reqTest = sceneTest.createReqTest({
      title: title || (trackingData.extInfo.route || {}).name,
      stTime: trackingData.time,
      method: trackingData.extInfo.method,
      url: trackingData.extInfo.originalUrl,
      header: header,
      body: trackingData.extInfo.body,
      judge: '',
      result: trackingData.extInfo.result,
      mockBlackList: [],
      mockWhiteList: []
    });

    // 整理mock数据
    const calls = this.getEdgeCall(trackingData.calls)
      .filter(call => {
        // 暂不支持自定义类作为mock数据
        if ([
          'Object', 'string', 'boolean', 'number', 'null', 'Array', 'Date', 'undefined', 'Error',
          /** mysql 返回数据类型 */
          'OkPacket', 'RowDataPacket',
        ].some(s => s === call.retType)) {
          return true;
        }
        return false;
      });
    const mockData: any = reqTest.info.mockData = {};
    calls.forEach(call => {
      if (!mockData[call.meta.clsName]) {
        mockData[call.meta.clsName] = {};
      }
      const clsMockData = mockData[call.meta.clsName];

      if (!clsMockData[call.method]) {
        clsMockData[call.method] = [];
      }

      clsMockData[call.method].push({
        args: call.args,
        isErr: call.isErr,
        retType: call.retType,
        ret: call.ret,
      });
    });

    reqTest.saveMockData();
    return reqTest.info;
  }

  @route({
    url: config => `${(config as any).et.metaPath}/test/scene/:id/req/:rid`,
    method: 'get', name: '在线使用测试用例', noTracking: true
  })
  async onlineTest(id: string, rid: string) {
    const req = new ReqTest(this.getReqTestPath(id, rid));
    if (!req.info) {
      throw new NotFoundError();
    }
    return await req.runTest();
  }

  @route({
    url: config => `${(config as any).et.metaPath}/test/scene/:id/req/:rid`,
    method: 'put', name: '更新使用测试用例', noTracking: true
  })
  async updateTest(id: string, rid: string) {
    const req = new ReqTest(this.getReqTestPath(id, rid));
    if (!req.info) {
      throw new NotFoundError();
    }
    return await req.setMode('update').runTest();
  }

  private mkdir(dirPath: string, onErr?: (err: Error) => void) {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
      }
    } catch (error) {
      onErr && onErr(error);
    }
  }

  private getEdgeCall(callData: CallData[], dataList: CallData[] = []) {
    callData.forEach(call => {
      const clsMethod = `${call.meta.clsName}.${call.method}`;
      if (call.calls.length) {
        // 白名单
        if (this.config.trackingSaveWhiteList.some(regex => regex.test(clsMethod))) {
          dataList.push(call);
        }
        this.getEdgeCall(call.calls, dataList);
      } else if (
        // 黑名单
        this.config.trackingSaveBlackList.every(regex => !regex.test(clsMethod))
      ) {
        dataList.push(call);
      }
    });
    return dataList;
  }
}
