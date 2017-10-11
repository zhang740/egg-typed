"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const egg_1 = require("egg");
const power_di_1 = require("power-di");
class Service extends egg_1.Service {
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
