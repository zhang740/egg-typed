"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./base");
const services = [];
class Service extends base_1.Service {
    GetComponent(classType) {
        const context = this.ctx.iocContext;
        return context.get(classType);
    }
}
exports.Service = Service;
function serviceMetadata(data = {}) {
    // const config = data.config || {};
    return function (target) {
        services.push({
            ...data,
            classConstructor: target,
        });
    };
}
exports.serviceMetadata = serviceMetadata;
function getServices() {
    return services;
}
exports.getServices = getServices;
