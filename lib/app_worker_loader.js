'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const router_1 = require("./type/router");
const service_1 = require("./type/service");
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
        // load app files
        this.loadApp();
        // register service
        this.registerServiceToIOC();
        // app > plugin > core
        this.loadMiddleware();
        // register router
        this.registerRouter();
    }
    loadDir(dirPath) {
        fs.readdirSync(dirPath)
            .filter(dir => [
            'view',
            'template',
            'public',
        ].indexOf(dir) < 0)
            .forEach(dirName => {
            const fullPath = path.join(dirPath, dirName);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                this.loadDir(fullPath);
            }
            else if (stat.isFile && path.parse(dirName).ext === '.js') {
                try {
                    require(fullPath);
                }
                catch (err) {
                    err.message = `[egg-typed] load file: ${fullPath}, error: ${err.message}`;
                    throw err;
                }
            }
        });
    }
    loadApp() {
        const self = this;
        const baseDir = self.options.baseDir;
        this.loadDir(path.join(baseDir, 'app'));
    }
    registerServiceToIOC() {
        const app = this.app;
        const ioc = app.iocContext;
        service_1.getServices().forEach(service => {
            const ServiceType = service.classConstructor;
            ioc.register(ServiceType, ServiceType, { autoNew: false });
        });
    }
    registerRouter() {
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
            this.app.router[route.method || 'all'](route.url, route.call());
        });
    }
}
exports.default = AppWorkerLoader;
