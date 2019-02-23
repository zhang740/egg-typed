import * as fs from 'fs';
import { registerTSNode, loadFile } from './loader_util';
import { ETConfig } from './app_worker_loader';
import { fork } from 'child_process';
import { fork as tsFork } from './fork';
const EggLoader = require('egg').AgentWorkerLoader as any;
export { EggLoader };

export default class AgentWorkerLoader extends EggLoader {
  protected get baseDir() {
    return this.options.baseDir as string;
  }
  private get etConfig(): ETConfig {
    return (
      (this.app.config && this.app.config.et) || {
        useTSRuntime: false,
      }
    );
  }
  fork = fork;
  private registeredTS = false;

  load() {
    if (this.etConfig.useTSRuntime) {
      registerTSNode(this.baseDir);
      this.registeredTS = true;
      this.fork = (...args) => tsFork(this.baseDir, ...args);
    }

    super.load();
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
