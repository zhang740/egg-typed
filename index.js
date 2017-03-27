"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./lib/framework.js"));
var controller_1 = require("./type/controller");
exports.Controller = controller_1.Controller;
var service_1 = require("./type/service");
exports.Service = service_1.Service;
var router_1 = require("./type/router");
exports.routerMetadata = router_1.routerMetadata;
exports.getRouters = router_1.getRouters;
