'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const app_worker_loader_1 = require("./app_worker_loader");
exports.AppWorkerLoader = app_worker_loader_1.default;
const path = require("path");
exports.egg = require('egg');
exports.EGG_PATH = Symbol.for('egg#eggPath');
exports.EGG_LOADER = Symbol.for('egg#loader');
const AgentWorkerLoader = exports.egg.AgentWorkerLoader;
exports.AgentWorkerLoader = AgentWorkerLoader;
const startCluster = exports.egg.startCluster;
exports.startCluster = startCluster;
class Application extends exports.egg.Application {
    get [exports.EGG_PATH]() {
        return path.dirname(__dirname);
    }
    get [exports.EGG_LOADER]() {
        return app_worker_loader_1.default;
    }
    GetComponent(classType) {
        const context = this.iocContext;
        return context.get(classType);
    }
}
exports.Application = Application;
exports.EGGAgent = exports.egg.Agent;
class Agent extends exports.EGGAgent {
    get [exports.EGG_PATH]() {
        return path.dirname(__dirname);
    }
}
exports.Agent = Agent;
