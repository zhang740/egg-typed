"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const egg_1 = require("egg");
const services = [];
class Service extends egg_1.Service {
}
exports.Service = Service;
function serviceMetadata(data = {}) {
    const config = data.config || {};
    return function (target) {
        services.push(Object.assign({}, data, { classConstructor: target }));
    };
}
exports.serviceMetadata = serviceMetadata;
function getServices() {
    return services;
}
exports.getServices = getServices;
