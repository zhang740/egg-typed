'use strict';

import { getRouters } from '../type/router';
const EggLoader = require('egg').AppWorkerLoader as ObjectConstructor;
export { EggLoader }

export default class AppWorkerLoader extends EggLoader {

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
        // app > plugin > core
        (this as any).loadMiddleware();
        // app
        (this as any).loadController();
        // app
        this.loadRouterByController(); // 依赖 controller
    }

    loadRouterByController() {
        getRouters().forEach(route => {
            (this as any).app.router[route.method || 'all'](route.url, `${route.type}.${route.functionName}`);
        });
    }
}
