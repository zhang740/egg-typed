"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const egg_1 = require("egg");
class Controller extends egg_1.Controller {
    getByIOC(classType) {
        return this.app.iocContext.get(classType);
    }
}
exports.Controller = Controller;
