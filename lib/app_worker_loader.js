'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = require("../type/router");
const service_1 = require("../type/service");
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
        this.registerServiceToIOC();
        // app > plugin > core
        this.loadMiddleware();
        // app, only for load file
        this.loadController();
        this.loadRouterByController(); // 依赖 controller
    }
    registerServiceToIOC() {
        const app = this.app;
        const ioc = app.iocContext;
        service_1.getServices().forEach(service => {
            const ServiceType = service.classConstructor;
            ioc.register(() => {
                const ctx = app.context;
                if (!ctx.app) {
                    ctx.app = app;
                }
                return new ServiceType(ctx);
            }, ServiceType, {
                singleton: false,
            });
        });
    }
    loadRouterByController() {
        router_1.getRouters()
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
            this.app.router[route.method || 'all'](route.url, route.call);
        });
    }
}
exports.default = AppWorkerLoader;
