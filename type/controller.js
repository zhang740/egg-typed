"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_context_class_1 = require("./base_context_class");
const power_di_1 = require("power-di");
class Controller extends base_context_class_1.BaseContextClass {
    GetService(serviceType) {
        const context = this.app.iocContext || power_di_1.IocContext.DefaultInstance;
        return context.get(serviceType);
    }
}
exports.Controller = Controller;
