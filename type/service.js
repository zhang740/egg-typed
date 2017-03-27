"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_context_class_1 = require("./base_context_class");
const power_di_1 = require("power-di");
class Service extends base_context_class_1.BaseContextClass {
    constructor(ctx) {
        super(ctx);
        const context = this.app.iocContext || power_di_1.IocContext.DefaultInstance;
        context.register(this, this.constructor);
    }
}
exports.Service = Service;
