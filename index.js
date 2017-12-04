"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./lib/framework.js"));
__export(require("./type/controller"));
var service_1 = require("./type/service");
exports.serviceMetadata = service_1.serviceMetadata;
exports.Service = service_1.Service;
var router_1 = require("./type/router");
exports.routerMetadata = router_1.routerMetadata;
__export(require("./type/base_context_class"));
__export(require("./type/decorators"));
