import * as fs from 'fs';
import * as path from 'path';
import { GetReturnType, ClassType } from 'power-di';
import { getGlobalType } from 'power-di/utils';
import { setCreateInstanceHook, removeCreateInstanceHook } from 'egg-aop';
import { assert, app, mock } from 'egg-mock/bootstrap';
import { ReqTestBase, SceneTestBase } from './lib/test/base';
import { getInstance } from './di';
import { BaseModel, IProvider, BaseRepository } from './orm';

/**
 * getAllTestScene
 * @param testSceneDir
 * @param whiteList scene id list
 */
export function getAllTestScene(testSceneDir: string, whiteList: string[] = []) {
  return fs
    .readdirSync(path.join(testSceneDir))
    .filter(dir => fs.statSync(path.join(testSceneDir, dir)).isDirectory())
    .map(dir => {
      return new SceneTest(path.join(testSceneDir, dir));
    })
    .filter(info => info && (!whiteList.length || whiteList.find(s => s === info.info.id)));
}

export class ReqTest extends ReqTestBase {
  runTest(context: any) {
    const { info } = this;
    it(`${info.title ? `${info.title}` : ''}[${info.method} ${info.url}][${info.id}]`, async () => {
      this.startMockData();
      return new Promise((resolve, reject) => {
        const request = app.httpRequest()[info.method.toLowerCase()](info.url);
        Object.keys(info.header || {}).forEach(key => {
          request.set(key, info.header[key]);
        });
        if (info.body && Object.keys(info.body).length) {
          request.send(info.body);
        }

        request
          .then((res: any, err: any) => {
            this.stopMockData();
            if (err) {
              console.error(err);
              reject(err);
            }

            if (info.judge) {
              const ret = new Function('with(this){ ' + info.judge + '}').call(context);
              if (ret === false) {
                throw new Error('判定失败');
              }
            }

            if (info.result) {
              if (info.result.status) {
                assert.equal(res.status, info.result.status, `status, ${JSON.stringify(res.text)}`);
              }
              if (info.result.body) {
                const accept = info.header['accept'] || '';
                let resBody =
                  res.status === 302 || accept.includes('text/html') ? res.text : res.body;
                assert.deepEqual(resBody, info.result.body, `body, ${JSON.stringify(res.text)}`);
              }
              if (info.result.error) {
                assert.deepEqual(
                  {
                    code: res.body.code,
                    message: res.body.message,
                  },
                  info.result.error,
                  'error'
                );
              }
            }

            resolve();
          })
          .catch((err: any) => {
            this.stopMockData();
            console.error(err);
            reject(err);
          });
      });
    });
  }
}

export class SceneTest extends SceneTestBase<ReqTest> {
  protected loadReqTest() {
    this._testReq = this.info.req.map(reqId => {
      return new ReqTest(path.join(this.dir, reqId));
    });
  }

  /**
   * run req test
   * @param reqWhiteList req id list
   */
  runTest(reqWhiteList: string[] = []) {
    const context = {};
    describe(`[SceneTest:${this.info.id}][${this.info.title}]`, () => {
      this.testReq
        .filter(req => !reqWhiteList.length || reqWhiteList.find(rid => req.info.id === rid))
        .map(r => r.runTest(context));
    });
  }
}

export declare type MockType<T> = { [P in keyof T]?: any };

export class GlobalMock {
  private mockData = new Map<string, Function>();

  start() {
    setCreateInstanceHook(this.hook);
  }

  mock(type: ClassType, mockFunc: (inst: any) => void) {
    this.mockData.set(getGlobalType(type), mockFunc);
  }

  stop() {
    removeCreateInstanceHook(this.hook);
  }

  private hook(inst: any) {
    const mockFunc = this.mockData.get(getGlobalType(inst.constructor));
    if (mockFunc) {
      mockFunc(inst);
    }
    return inst;
  }
}

export class TestSuite {
  readonly app: typeof app;
  readonly ctx: any;
  readonly globalMock = new GlobalMock();

  constructor(_app: typeof app = app) {
    this.app = _app;
    this.ctx = _app.mockContext();
  }

  get<T = undefined, KeyType = any>(clsType: KeyType): GetReturnType<T, KeyType> {
    return getInstance(clsType, this.ctx.app, this.ctx);
  }

  mock<T extends ClassType>(type: T, func: (inst: MockType<InstanceType<T>>) => void) {
    func(this.get<any>(type));
  }

  getRepo<T extends typeof BaseModel>(modelType: T) {
    const provider = this.get<IProvider>(IProvider);
    return provider.getRepositoryByModelClass(modelType);
  }

  mockRepo<T extends typeof BaseModel>(
    modelType: T,
    func: (inst: MockType<BaseRepository>) => void
  ) {
    func(this.getRepo(modelType));
  }
}

export function getTestSuite() {
  return new TestSuite();
}

/** 直接 mock class proto */
export function mockProto<T, K extends keyof T, P>(
  proto: T,
  method: K,
  mockData: T[K] extends (...args: P[]) => any
    ? (
        ...args: P[]
      ) => ReturnType<T[K]> extends Promise<infer X>
        ? Partial<X> | Promise<Partial<X>>
        : Partial<ReturnType<T[K]>>
    : T[K]
) {
  mock(proto, method as any, mockData);
}
