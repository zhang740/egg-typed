import 'colors';
import * as fs from 'fs';
import * as Diff from 'diff';
import * as path from 'path';
import * as rimraf from 'rimraf';
import * as uuid from 'uuid';
import * as assert from 'power-assert';
import * as levenshtein from 'fast-levenshtein';
import { CallData, getResultFromCtx, ResultType } from '../../tracking';
import { getGlobalType, getSuperClassInfo } from 'power-di/utils';
import { setCreateInstanceHook, removeCreateInstanceHook, aspect, funcWrapper, FunctionContext } from '../../di';

export const INFO_FILE_NAME = 'info.json';
export const MOCK_DATA_DIR = 'mock-data';

/** 测试场景 */
export interface SceneData {
  /** 场景唯一标识，目录名 */
  id: string;
  /** 场景标题 */
  title: string;
  /** 场景描述 */
  description?: string;
  /** 请求 Id[] */
  req: string[];
}

/** 请求序列 */
export interface TestReqData {
  id?: string;
  /** 请求介绍 */
  title?: string;
  /** 开始时间 */
  stTime: number;
  /** 请求方法 */
  method: string;
  /** 请求路径 */
  url: string;
  /** header */
  header: { [key: string]: string };
  /** data */
  body: any;
  /** 返回结果判定函数 */
  judge: string;
  /** 请求返回值 */
  result: { status?: number, body?: any, error?: any };
  /** mock数据黑名单，'clsName.method' 格式 */
  mockBlackList: string[];
  /** mock数据白名单，'clsName.method' 格式 */
  mockWhiteList: string[];
  /** mock数据，待分离 */
  mockData?: ReqMockDataType;
}

/** 请求 Mock 数据类型 */
export interface ReqMockDataType {
  /** 类名 */
  [clsName: string]: {
    /** 方法名 */
    [method: string]: MockDataType[],
  };
}

/** Mock 数据类型 */
export interface MockDataType extends ResultType {
  args: any[];
}

export class TestBase {
  protected readonly infoPath: string;

  constructor(protected dir: string) {
    this.infoPath = path.join(this.dir, INFO_FILE_NAME);
  }

  protected mkdir(dir: string) {
    if (!fs.existsSync(dir)) {
      this.mkdir(path.dirname(dir));
      fs.mkdirSync(dir);
    }
  }

  protected readFile(filePath: string) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  protected writeFile(filePath: string, data: any) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  protected saveInfo(data: any) {
    this.mkdir(this.dir);
    delete data.id;
    this.writeFile(this.infoPath, data);
  }

  protected loadInfo() {
    if (fs.existsSync(this.infoPath)) {
      const info = this.readFile(this.infoPath);
      info.id = path.parse(this.dir).name;
      return info;
    }
  }

  remove() {
    rimraf.sync(this.dir);
  }
}

const OriginDate = Date;
export type ReqRunMode =
  /** 正常Mock */
  'normal' |
  /** 尝试全量更新Mock */
  'update' |
  /** 尝试只修复错误Mock */
  'fix';
export class ReqTestBase extends TestBase {
  info: TestReqData;
  protected readonly mockDir: string;
  protected mode: ReqRunMode = 'normal';
  private startMockTime: number;
  private tmpMockData: { [clsName: string]: { [key: string]: MockDataType[] } } = {};

  constructor(dir: string) {
    super(dir);
    this.mockDir = path.join(this.dir, MOCK_DATA_DIR);

    this.info = this.loadInfo();
    if (this.info) {
      this.info.mockData = {};
      this.loadMockData();
    }
  }

  setMode(mode: ReqRunMode) {
    this.mode = mode;
    return this;
  }

  loadMockData() {
    if (fs.existsSync(this.mockDir)) {
      fs.readdirSync(this.mockDir).forEach(clsName => {
        const clsMockData: any = {};
        this.info.mockData[clsName] = clsMockData;
        fs.readdirSync(path.join(this.mockDir, clsName)).forEach(methodFile => {
          clsMockData[path.parse(methodFile).name] = JSON.parse(
            fs.readFileSync(path.join(this.mockDir, clsName, methodFile), 'utf-8'),
          );
        });
      });
    }
  }

  saveMockData() {
    if (this.info) {
      rimraf.sync(this.mockDir);
      Object.keys(this.info.mockData).forEach(clsName => {
        const clsMockData = this.info.mockData[clsName];
        const clsDir = path.join(this.mockDir, clsName);
        this.mkdir(clsDir);
        Object.keys(clsMockData).forEach(method => {
          this.writeFile(path.join(clsDir, `${method}.json`), clsMockData[method]);
        });
      });
    }
  }

  startMockData() {
    this.tmpMockData = {};
    this.startMockTime = +new OriginDate();
    const getNow = () => {
      const between = OriginDate.now() - this.startMockTime;
      return this.info.stTime + between;
    };
    (Date as any) = new Proxy(OriginDate, {
      get: (target, p) => {
        if (p === 'now') {
          return getNow;
        }
        if (p === 'constructor') {
          return function (...args: any[]) {
            if (args.length) {
              return new (OriginDate as any)(...args);
            }
            return new OriginDate(getNow());
          };
        }
        return (target as any)[p];
      }
    });
    setCreateInstanceHook(this.mockFunc);
  }

  stopMockData() {
    removeCreateInstanceHook(this.mockFunc);
    (Date as any) = OriginDate;
    if (this.mode === 'update' || this.mode === 'fix') {
      this.saveMockData();
    }
  }

  saveInfo() {
    if (this.info) {
      const data = { ...this.info };
      delete data.mockData;
      super.saveInfo(data);
    }
  }

  addMockData(clsName: string, methodName: string, data: MockDataType) {
    const mockData = this.info.mockData;
    if (!mockData[clsName]) {
      mockData[clsName] = {};
    }
    const clsMockData = mockData[clsName];

    if (!clsMockData[methodName]) {
      clsMockData[methodName] = [];
    }

    clsMockData[methodName].push(data);
  }

  private mockFunc = (inst: any) => {
    const self = this;
    const { mockData } = this.info;
    const runMode = this.mode;

    // 类级 Mock 数据
    const clsType = getGlobalType(inst.constructor);
    const superClasses = getSuperClassInfo(inst.constructor);
    const mockClsNames = [clsType].concat(superClasses.map(ti => ti.type)).filter(cn => !!mockData[cn]);
    const clsMockData = mockClsNames.length && mockClsNames.map(mockClsName => mockData[mockClsName]);

    return new Proxy(inst, {
      get(target, property) {
        const originProp = target[property];
        if (
          typeof property !== 'string' ||
          property === 'constructor' ||
          !clsMockData ||
          clsMockData.every(mockData => mockData[property] === undefined)
        ) {
          return originProp;
        }

        // 方法级 Mock 数据
        const clsMockDataIndex = clsMockData.findIndex(mockData => mockData[property] !== undefined);
        const mockClsName = mockClsNames[clsMockDataIndex];
        const methodMockData = clsMockData[clsMockDataIndex][property];

        if (!self.tmpMockData[mockClsName]) {
          self.tmpMockData[mockClsName] = {};
        }
        const tmpMockData = self.tmpMockData[mockClsName];

        function updateMockData(index = -1, deleteCount = 0) {
          function getResult(ctx: FunctionContext) {
            if (index === -1) {
              methodMockData.push({
                args: ctx.args,
                ...getResultFromCtx(ctx),
              });
            } else {
              methodMockData.splice(index, deleteCount, {
                args: ctx.args,
                ...getResultFromCtx(ctx),
              });
            }
          }
          return funcWrapper({
            after: getResult,
            error: getResult,
          }, originProp);
        }

        if (runMode === 'update') {
          methodMockData.splice(0);
          updateMockData();
        } else if (runMode === 'normal' || runMode === 'fix') {
          if (!tmpMockData[property]) {
            tmpMockData[property] = [...methodMockData];
          }
          const thisMockData = tmpMockData[property];
          return function (...args: any[]) {
            const acArgs = JSON.stringify(args);

            if (!thisMockData.length) {
              if (runMode === 'fix') {
                return updateMockData().bind(target)(...args);
              } else {
                throw new Error(`Mock数据数量不匹配，type:[${clsType}(${mockClsName})] method:[${property}] 剩余:[${thisMockData.length}]\n`);
              }
            }

            let callDataIndex = thisMockData.findIndex(d => acArgs === JSON.stringify(d.args));

            // FIXME 绕过修改数据时修改时间不匹配问题
            if (callDataIndex < 0 &&
              args.length === 2 &&
              typeof args[0] === 'string' &&
              ['update', 'insert'].some(s => (args[0] as string).toLowerCase().startsWith(s)) &&
              (args[0] as string).toLowerCase().indexOf('gmt_modified') > 0
            ) {
              callDataIndex = thisMockData.findIndex(
                m => {
                  if (m.args[0] !== args[0]) return false;
                  return args[1].filter(
                    (arg: any, i: number) => {
                      const mockArg = m.args[1][i];
                      // 忽略 null undefined 判断
                      if ((arg === undefined || arg === null) && (mockArg === undefined || mockArg === null)) {
                        return false;
                      }
                      // 忽略 Date
                      if (arg instanceof Date && typeof mockArg === 'string' && new Date(mockArg).toString() !== 'Invalid Date') {
                        return false;
                      }
                      return arg !== mockArg;
                    },
                  ).length === 0;
                },
              );
            }

            if (callDataIndex < 0) {
              if (runMode === 'fix') {
                const readIndex = methodMockData.indexOf(thisMockData[0]);
                const updateIndex = methodMockData.findIndex((m, i) => {
                  return i >= readIndex && m.args[0] === args[0];
                });
                return updateMockData(
                  updateIndex === -1 ? readIndex : updateIndex,
                  updateIndex === -1 ? 0 : 1,
                ).bind(target)(...args);
              } else {
                let targetMockData = thisMockData[0];
                if (acArgs.length < 5000) {
                  const sorts = thisMockData.map(t => {
                    return Diff.diffWords(acArgs, JSON.stringify(t.args)).length;
                  });
                  let minIndex = 0, minScore = sorts[0];
                  sorts.forEach((s, i) => {
                    if (s < minScore) {
                      minIndex = i;
                    }
                  });
                  console.log('[Test Request Id]', self.info.id);
                  console.log('[by diff change count]', sorts[minIndex], self.info.id);
                  if (sorts[minIndex] > 8) {
                    console.log('差异过大，未找到匹配项');
                    targetMockData = undefined;
                  } else {
                    targetMockData = thisMockData[minIndex];
                  }
                }

                function hasDiff(part: Diff.IDiffResult) {
                  return part && (part.added || part.removed);
                }

                if (targetMockData) {
                  targetMockData.args.map((arg, i) => ({ i, arg }))
                    .filter(data => JSON.stringify(data.arg) !== JSON.stringify(args[data.i]))
                    .forEach(data => {
                      console.log(`[参数 {${data.i}} 不匹配]:`);
                      let diffResult: Diff.IDiffResult[];
                      if (typeof data.arg === 'string' && typeof args[data.i] === 'string') {
                        diffResult = Diff.diffWords(data.arg, args[data.i]);
                      } else {
                        diffResult = Diff.diffLines(
                          JSON.stringify(data.arg, null, 2),
                          JSON.stringify(args[data.i], null, 2),
                        );
                      }
                      diffResult.filter((part, i, parts) => {
                        return hasDiff(part) ||
                          hasDiff(parts[i - 1]) ||
                          hasDiff(parts[i + 1]);
                      }).forEach(part => {
                        let color = part.added ? 'green' :
                          part.removed ? 'red' : 'grey';
                        process.stderr.write(part.value[color as any]);
                      });
                      console.log();
                    });
                }

                console.log('[实际入参]', JSON.stringify(args));
                throw new Error(`Mock数据参数不匹配，type:[${clsType}(${mockClsName})] method:[${property}] 剩余:[${thisMockData.length}]\n`);
              }
            }

            const callData = thisMockData.splice(callDataIndex, 1)[0];

            if (callData.isErr) {
              throw new Error(callData.err);
            } else if (callData.retType === 'Date') {
              return new Date(callData.ret);
            } else {
              return callData.ret;
            }
          };
        }
      }
    });
  }
}

export class SceneTestBase<ReqTestType extends ReqTestBase = ReqTestBase> extends TestBase {
  info: SceneData;
  get testReq() { return this._testReq; }
  protected _testReq: ReqTestType[];

  constructor(dir: string) {
    super(dir);

    this.info = this.loadInfo();
    if (this.info) {
      this.info.req = this.info.req || [];
      this.info.req = Array.from(new Set(this.info.req.concat(fs.readdirSync(dir) || [])))
        .filter(
          reqDir =>
            fs.existsSync(path.join(dir, reqDir)) &&
            fs.statSync(path.join(dir, reqDir)).isDirectory(),
      );
      this.loadReqTest();
      this._testReq = this._testReq.filter(req => req.info);
      this.info.req = this._testReq.map(req => req.info.id);
      this.saveInfo();
    }
  }

  setReqRunMode(mode: ReqRunMode) {
    this._testReq.forEach(req => req.setMode(mode));
    return this;
  }

  protected loadReqTest() {
    this._testReq = this.info.req.map(reqId => {
      return new ReqTestBase(path.join(this.dir, reqId)) as ReqTestType;
    });
  }

  saveInfo() {
    if (this.info) {
      super.saveInfo({ ...this.info });
      this._testReq
        .filter(req => this.info.req.every(r => r !== req.info.id))
        .forEach(req => req.remove());
      this.loadReqTest();
    }
  }

  createReqTest(info: TestReqData) {
    const id = uuid.v4();

    const reqTest = new ReqTestBase(path.join(this.dir, id));
    reqTest.info = info;
    reqTest.saveInfo();

    this.info.req.push(id);
    this.loadReqTest();
    this.saveInfo();

    return reqTest;
  }
}
