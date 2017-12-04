'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const app_worker_loader_1 = require("./app_worker_loader");
exports.AppWorkerLoader = app_worker_loader_1.default;
const path = require("path");
exports.egg = require('egg');
const EGG_PATH = Symbol.for('egg#eggPath');
const EGG_LOADER = Symbol.for('egg#loader');
const AgentWorkerLoader = exports.egg.AgentWorkerLoader;
exports.AgentWorkerLoader = AgentWorkerLoader;
const startCluster = exports.egg.startCluster;
exports.startCluster = startCluster;
const power_di_1 = require("power-di");
class Application extends exports.egg.Application {
    get iocContext() {
        if (!this._iocContext) {
            this._iocContext = power_di_1.IocContext.DefaultInstance;
        }
        return this._iocContext;
    }
    get [EGG_PATH]() {
        return path.dirname(__dirname);
    }
    get [EGG_LOADER]() {
        return app_worker_loader_1.default;
    }
    GetService(serviceType) {
        const context = this.iocContext;
        return context.get(serviceType);
    }
}
exports.Application = Application;
exports.EGGAgent = exports.egg.Agent;
class Agent extends exports.EGGAgent {
    get [EGG_PATH]() {
        return path.dirname(__dirname);
    }
}
exports.Agent = Agent;
