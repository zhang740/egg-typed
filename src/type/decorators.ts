import { BaseContextClass } from './base_context_class';

/**
 * lazy inject, use for Controller/Service class
 * @param type class or string
 * @param always always read from context. default: false
 */
export function lazyInject(classType: any, always = false): any {
  return (target: any, key: any) => {
    Object.defineProperty(target, key, {
      configurable: !always,
      get: function (this: BaseContextClass) {
        const data = this.app.iocContext.get(classType);
        if (!data) {
          this.app.logger.warn(`No class ${classType.__type}`);
        } else if (!always) {
          Object.defineProperty(target, key, {
            value: data
          });
        }
        return data;
      }
    });
  };
}
