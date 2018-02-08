"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("power-di/lib/utils");
const decorators_1 = require("power-di/lib/helper/decorators");
const utils_2 = require("power-di/utils");
/**
 * lazy inject, use for Controller/Service/Any other BaseContextClass
 * This can new Class and inject app/ctx (need from ctx)
 * @param type class or string
 */
function lazyInject(from, classType) {
    return (target, key) => {
        classType = decorators_1.getGlobalTypeByDecorator(classType, target, key);
        return {
            configurable: true,
            get: function () {
                let value = undefined;
                switch (from) {
                    case 'Application':
                        const dataFromApp = this.app.iocContext.get(classType);
                        if (!dataFromApp) {
                            throw new Error(`No class [${classType}] found from AppIOC, from param: [${from}].`);
                        }
                        if (!utils_1.isClass(dataFromApp)) {
                            value = dataFromApp;
                            break;
                        }
                        value = new dataFromApp;
                        value.app = this.app;
                        this.app.iocContext.replace(classType, value, undefined, true);
                        break;
                    case 'Context':
                        const dataFromCtx = this.ctx.iocContext.get(classType);
                        if (dataFromCtx) {
                            value = dataFromCtx;
                            break;
                        }
                        let dataType = this.app.iocContext.get(classType);
                        if (!dataType) {
                            throw new Error(`No class [${classType}] found from AppIOC, from param: [${from}].`);
                        }
                        if (!utils_1.isClass(dataType)) {
                            dataType = dataType.constructor;
                        }
                        if (!this.ctx) {
                            throw new Error(`Inject from Context, [${utils_2.getGlobalType(this.constructor)}] MUST in Context.`);
                        }
                        value = new dataType(this.ctx);
                        value.ctx = this.ctx;
                        value.app = this.app;
                        this.ctx.iocContext.replace(classType, value, undefined, true);
                        break;
                }
                Object.defineProperty(this, key, {
                    configurable: true,
                    value: value
                });
                return value;
            }
        };
    };
}
exports.lazyInject = lazyInject;
function lazyInjectFromApp(classType) {
    return lazyInject('Application', classType);
}
exports.lazyInjectFromApp = lazyInjectFromApp;
function lazyInjectFromCtx(classType) {
    return lazyInject('Context', classType);
}
exports.lazyInjectFromCtx = lazyInjectFromCtx;
