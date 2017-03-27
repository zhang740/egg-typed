"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("power-di/utils");
const routes = [];
function routerMetadata(data) {
    return function (target, key, descriptor) {
        data.type = utils_1.getGlobalType(target.constructor).split('_')[0].replace('Controller', '').toLowerCase();
        data.functionName = key;
        routes.push(data);
    };
}
exports.routerMetadata = routerMetadata;
function getRouters() {
    return routes;
}
exports.getRouters = getRouters;
