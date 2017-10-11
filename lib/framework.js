'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const app_worker_loader_1 = require("./app_worker_loader");
exports.AppWorkerLoader = app_worker_loader_1.default;
const path = require("path");
const egg = require('egg');
const EGG_PATH = Symbol.for('egg#eggPath');
const EGG_LOADER = Symbol.for('egg#loader');
const AgentWorkerLoader = egg.AgentWorkerLoader;
exports.AgentWorkerLoader = AgentWorkerLoader;
const startCluster = egg.startCluster;
exports.startCluster = startCluster;
const power_di_1 = require("power-di");
exports.EGGApplication = egg.Application;
exports.EGGAgent = egg.Agent;
class Application extends exports.EGGApplication {
    get [EGG_PATH]() {
        return path.dirname(__dirname);
    }
    get [EGG_LOADER]() {
        return app_worker_loader_1.default;
    }
    GetService(serviceType) {
        const context = this.iocContext || power_di_1.IocContext.DefaultInstance;
        return context.get(serviceType);
    }
}
exports.Application = Application;
class Agent extends exports.EGGAgent {
    get [EGG_PATH]() {
        return path.dirname(__dirname);
    }
}
exports.Agent = Agent;
