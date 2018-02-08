"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./base");
class Controller extends base_1.Controller {
    GetComponent(classType) {
        const context = this.ctx.iocContext;
        return context.get(classType);
    }
}
exports.Controller = Controller;
