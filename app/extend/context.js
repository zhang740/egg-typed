'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const power_di_1 = require("power-di");
const IOC = Symbol('Context#PowerDI');
module.exports = {
    get iocContext() {
        if (!this[IOC]) {
            this[IOC] = new power_di_1.IocContext();
        }
        return this[IOC];
    },
};
