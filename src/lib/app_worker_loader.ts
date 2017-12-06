'use strict';

import { getRouters } from '../type/router';
import { Application as EggApplication } from 'egg';
import { Application } from './framework';
import { Service, getServices } from '../type/service';
const EggLoader = require('egg').AppWorkerLoader as ObjectConstructor;
export { EggLoader };

export default class AppWorkerLoader extends EggLoader {
  app: EggApplication & Application;

  /**
   * 开始加载所有约定目录
   * @since 1.0.0
   */
  load() {
    // app > plugin > core
    (this as any).loadApplicationExtend();
    (this as any).loadRequestExtend();
    (this as any).loadResponseExtend();
    (this as any).loadContextExtend();
    (this as any).loadHelperExtend();

    // app > plugin
    (this as any).loadCustomApp();

    // app > plugin
    (this as any).loadService();
    this.registerServiceToIOC();

    // app > plugin > core
    (this as any).loadMiddleware();

    // app, only for load file
    (this as any).loadController();
    this.loadRouterByController(); // 依赖 controller
  }

  registerServiceToIOC() {
    const app = this.app;

    const ioc = app.iocContext;
    getServices().forEach(service => {
      const ServiceType = service.classConstructor;

      ioc.register(() => {
        const ctx = app.context;
        if (!(ctx as any).app) {
          (ctx as any).app = app;
        }
        return new ServiceType(ctx);
      },
        ServiceType,
        {
          singleton: false,
        });
    });
  }

  loadRouterByController() {
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
        (this as any).app.router[route.method || 'all'](route.url, route.call);
      });
  }
}
