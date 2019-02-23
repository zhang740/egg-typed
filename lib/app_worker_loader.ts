import * as fs from 'fs';
import * as path from 'path';
import { setCreateInstanceHook } from 'egg-aop';
import { trackingInstance, inspectPromiseAll } from 'egg-typed-tracking';
import { Application as EggApplication, Context } from 'egg';
import { Application } from './framework';
import { loadFile, registerTSNode } from './loader_util';
import { getRefMapMetadata } from './meta/meta';
import { noTrackingSymbol, trackingMiddleware } from './middleware/tracking';
import { addDefaultMiddleware } from '.';
import { fork } from 'child_process';
import { fork as tsFork } from './fork';
const EggLoader = require('egg').AppWorkerLoader as any;
export { EggLoader };

export interface ETConfig {
  /** use with autoLoadDir */
  excludeDir: string[];
  /** default: true */
  autoLoadDir: boolean;
  /** default: true */
  useTSRuntime: boolean;
  /** default: true */
  useTracking: boolean;
  /** use meta api, default: true */
  useMetaApi: boolean;
  /** meta base url, default: '/$metadata' */
  metaPath: string;
}

function getSymbol(obj: any, symbol: symbol) {
  const desc = Object.getOwnPropertyDescriptor(obj, symbol);
  return desc && desc.value;
}

export default class AppWorkerLoader extends EggLoader {
  private get etConfig(): ETConfig {
    return (
      (this.app.config && this.app.config.et) || {
        useTSRuntime: false,
      }
    );
  }
  protected get baseDir() {
    return this.options.baseDir as string;
  }
  app: EggApplication & Application;

  protected metadataPath = path.join(this.baseDir, 'run');

  fork = fork;
  private registeredTS = false;

  /**
   * 开始加载所有约定目录
   * @since 1.0.0
   */
  load() {
    if (this.etConfig.useTSRuntime) {
      registerTSNode(this.baseDir);
      this.registeredTS = true;
      this.fork = (...args) => tsFork(this.baseDir, ...args);
    }

    addDefaultMiddleware([trackingMiddleware as any]);

    super.load();

    if (!fs.existsSync(this.metadataPath)) {
      fs.mkdirSync(this.metadataPath);
    }

    // TODO 待分离tracking插件
    if (this.etConfig.useTracking) {
      inspectPromiseAll();
      setCreateInstanceHook((inst, _app, ctx: Context) => {
        if (!ctx || !getSymbol(ctx, noTrackingSymbol)) {
          trackingInstance(inst);
        }
        return inst;
      });
    }

    // load app files
    if (this.etConfig.autoLoadDir) {
      this.autoLoadApp();
    }

    if (this.etConfig.useMetaApi) {
      require('./meta/controller');
    }

    // 组件依赖关系元信息
    fs.writeFileSync(
      path.join(this.metadataPath, 'ref_map.json'),
      JSON.stringify(getRefMapMetadata(this.app.config), null, 2),
      { encoding: 'utf8' }
    );
  }

  autoLoadDir(dirPath: string) {
    fs.readdirSync(dirPath)
      .filter(dir => [].concat(this.etConfig.excludeDir).indexOf(dir) < 0)
      .forEach(dirName => {
        const fullPath = path.join(dirPath, dirName);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          this.autoLoadDir(fullPath);
        } else if (stat.isFile()) {
          const ext = path.parse(dirName).ext;
          if (this.etConfig.useTSRuntime) {
            if (ext === '.ts' && dirName.indexOf('.d.ts') < 0) {
              loadFile(fullPath);
            }
          } else {
            if (ext === '.js') {
              loadFile(fullPath);
            }
          }
        }
      });
  }

  autoLoadApp() {
    this.autoLoadDir(path.join(this.baseDir, 'app'));
  }

  loadFile(filepath: string, ...inject: any[]) {
    if (!this.registeredTS) {
      return super.loadFile(filepath, ...inject);
    }
    const tsFilePath = filepath.replace('.js', '.ts');
    if (!fs.existsSync(tsFilePath)) {
      // fallback
      return super.loadFile(filepath, ...inject);
    }
    let ret = loadFile(tsFilePath);
    if ('default' in ret) {
      ret = ret.default;
    }
    // function(arg1, args, ...) {}
    if (inject.length === 0) inject = [this.app];
    return ret instanceof Function ? ret(...inject) : ret;
  }
}
