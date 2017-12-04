"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * lazy inject, use for Controller/Service class
 * @param type class or string
 * @param always always read from context. default: false
 */
function lazyInject(classType, always = false) {
    return (target, key) => {
        Object.defineProperty(target, key, {
            configurable: !always,
            get: function () {
                const data = this.app.iocContext.get(classType);
                if (!data) {
                    this.app.logger.warn(`No class ${classType.__type}`);
                }
                else if (!always) {
                    Object.defineProperty(target, key, {
                        value: data
                    });
                }
                return data;
            }
        });
    };
}
exports.lazyInject = lazyInject;
