'use strict';

import * as fs from 'fs';
import * as path from 'path';
import { getRouters } from './type/router';
import { Application as EggApplication } from 'egg';
import { Application } from './framework';
import { getServices } from './type/service';
const EggLoader = require('egg').AppWorkerLoader as any;
export { EggLoader };

export default class AppWorkerLoader extends EggLoader {
  app: EggApplication & Application;

  /**
   * 开始加载所有约定目录
   * @since 1.0.0
   */
  load() {
    super.load();

    // load app files
    this.loadApp();

    // register service
    this.registerServiceToAppIOC();

    // register router
    this.registerRouter();
  }

  loadDir(dirPath: string) {
    fs.readdirSync(dirPath)
      .filter(dir => [
        'assets',
        'view',
        'template',
        'public',
        'test',
      ].indexOf(dir) < 0)
      .forEach(dirName => {
        const fullPath = path.join(dirPath, dirName);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          this.loadDir(fullPath);
        } else if (stat.isFile && path.parse(dirName).ext === '.js') {
          try {
            require(fullPath);
          } catch (err) {
            err.message = `[egg-typed] load file: ${fullPath}, error: ${err.message}`;
            throw err;
          }
        }
      });
  }

  loadApp() {
    const self = this as any;
    const baseDir: string = self.options.baseDir;
    this.loadDir(path.join(baseDir, 'app'));
  }

  registerServiceToAppIOC() {
    const app = this.app;

    const ioc = app.iocContext;
    getServices().forEach(service => {
      const ServiceType = service.classConstructor;

      ioc.register(ServiceType, ServiceType, { autoNew: false });
    });
  }

  registerRouter() {
    getRouters()
      .sort((a, b) => {
        if (a.url === b.url) {
          return 0;
        }
        if (a.url === '/*') {
          return 1;
        }
        return a.url > b.url ? -1 : 1;
      })
      .forEach(route => {
        (this as any).app.register(
          route.url,
          [].concat(route.method || 'all'),
          [].concat(
            route.beforeMiddleware.map(m => m(this.app)),
            route.call(),
            route.afterMiddleware.map(m => m(this.app)),
          )
        );
      });
  }
}
