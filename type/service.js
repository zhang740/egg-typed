"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_context_class_1 = require("./base_context_class");
const power_di_1 = require("power-di");
class Service extends base_context_class_1.BaseContextClass {
    constructor(ctx, config = {
            singleton: false
        }) {
        super(ctx);
        const context = this.app.iocContext || power_di_1.IocContext.DefaultInstance;
        if (!this.constructor.__type) {
            context.register(this, this.constructor, {
                singleton: config.singleton
            });
        }
    }
}
exports.Service = Service;
