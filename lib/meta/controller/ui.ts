import * as fs from 'fs';
import * as path from 'path';
import { Context } from 'egg';
import { route } from 'egg-controller';
import { UiBase, ReqGroupTestBase } from '../../test/ui';
import { getTrackingDatas } from 'egg-typed-tracking';
import { NotFoundError } from 'egg-controller/error';

export class UiController {

  private config: {
    basePath: string;
  };

  private readonly uiRootDir: string;

  constructor(ctx: Context) {
    this.config = (ctx.app.config as any).et.uiTest;
    this.uiRootDir = path.join(ctx.app.baseDir, this.config.basePath);
    this.mkdir(this.uiRootDir);
  }

  getUiTest(uiid: string) {
    return new UiBase(path.join(this.uiRootDir, uiid));
  }

  getUiGroup(uiid: string, gid: string) {
    return new ReqGroupTestBase(path.join(this.uiRootDir, uiid, gid));
  }

  @route({
    url: config => `${(config as any).et.metaPath}/uitest`,
    name: '获取 ui 测试列表',
    noTracking: true,
  })
  getUiList() {
    return fs.readdirSync(this.uiRootDir).map(uiid => {
      return this.getUiTest(uiid).info;
    }).filter(info => info);
  }

  @route({
    url: config => `${(config as any).et.metaPath}/uitest/:uiid`,
    name: '获取 ui 测试组列表',
    noTracking: true,
  })
  getUi(uiid: string) {
    const uiTest = this.getUiTest(uiid);
    return uiTest.reqGroupTests.map(rgt => ({
      ...rgt.info,
      gid: rgt.info.id,
    }));
  }

  @route({
    url: config => `${(config as any).et.metaPath}/uitest`,
    method: 'post',
    name: 'add-ui-test',
    description: '添加 UI 测试',
    noTracking: true,
  })
  addUiTest(uiid: string, title: string) {
    const uiTest = this.getUiTest(uiid);
    uiTest.info = {
      uiid, title, reqGroups: []
    };
    uiTest.saveInfo();
    return true;
  }

  @route({
    url: config => `${(config as any).et.metaPath}/uitest/:uiid`,
    method: 'post',
    name: 'add-ui',
    description: '添加 UI 测试组',
    noTracking: true,
  })
  addUi(uiid: string, title: string, tids: number[]) {
    const trackingDatas = getTrackingDatas();
    if (trackingDatas.length <= 0) {
      throw new NotFoundError('调用跟踪为空!');
    }

    const filterTrackingDatas = trackingDatas.filter(
      trackingData => tids.indexOf(trackingData.id) >= 0,
    );

    const uiTest = this.getUiTest(uiid);

    const reqGroupTest = filterTrackingDatas.map(trackingData => {
      // 数据修剪
      const header = {
        ...trackingData.extInfo.header,
      };
      delete header['content-length'];

      return {
        title: (trackingData.extInfo.route || {}).name,
        stTime: trackingData.time,
        method: trackingData.extInfo.method,
        url: trackingData.extInfo.originalUrl,
        header,
        body: trackingData.extInfo.body,
        judge: '',
        result: trackingData.extInfo.result,
        mockBlackList: [],
        mockWhiteList: []
      };
    });

    uiTest.saveRegGroupTest(title, reqGroupTest);

    return uiTest;
  }

  @route({
    url: config => `${(config as any).et.metaPath}/uitest/:uiid`,
    method: 'delete',
    name: 'del-ui',
    description: '删除 UI 测试',
    noTracking: true,
  })
  delUi(uiid: string) {
    this.getUiTest(uiid).remove();
  }

  @route({
    url: config => `${(config as any).et.metaPath}/uitest/:uiid/group/:gid`,
    method: 'delete',
    name: 'del-ui-group',
    description: '删除 UI 测试分组',
    noTracking: true,
  })
  delUiGroup(uiid: string, gid: string) {
    this.getUiGroup(uiid, gid).remove();
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
}
