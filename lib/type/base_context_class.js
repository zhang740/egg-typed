"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./base");
class BaseContextClass extends base_1.BaseContextClass {
    GetComponent(classType) {
        const context = this.ctx.iocContext;
        return context.get(classType);
    }
}
exports.BaseContextClass = BaseContextClass;
