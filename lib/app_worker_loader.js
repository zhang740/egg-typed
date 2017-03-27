'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = require("../type/router");
const EggLoader = require('egg').AppWorkerLoader;
exports.EggLoader = EggLoader;
class AppWorkerLoader extends EggLoader {
    /**
     * 开始加载所有约定目录
     * @since 1.0.0
     */
    load() {
        // app > plugin > core
        this.loadApplicationExtend();
        this.loadRequestExtend();
        this.loadResponseExtend();
        this.loadContextExtend();
        this.loadHelperExtend();
        // app > plugin
        this.loadCustomApp();
        // app > plugin
        this.loadService();
        // app > plugin > core
        this.loadMiddleware();
        // app
        this.loadController();
        // app
        this.loadRouterByController(); // 依赖 controller
    }
    loadRouterByController() {
        router_1.getRouters().forEach(route => {
            this.app.router[route.method || 'all'](route.url, `${route.type}.${route.functionName}`);
        });
    }
}
exports.default = AppWorkerLoader;
