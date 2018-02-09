import { BaseContextClass } from './base_context_class';
import { isClass } from 'power-di/lib/utils';
import { getGlobalTypeByDecorator } from 'power-di/lib/helper/decorators';
import { getGlobalType } from 'power-di/utils';

/**
 * lazy inject, use for Controller/Service/Any other BaseContextClass
 * This can new Class and inject app/ctx (need from ctx)
 * @param type class or string
 */
export function lazyInject(from: 'Application' | 'Context', classType?: any): any {
  return (target: any, key: any) => {
    classType = getGlobalTypeByDecorator(classType, target, key);
    return {
      configurable: true,
      get: function (this: BaseContextClass) {
        let value: any = undefined;
        switch (from) {
          case 'Application':
            const dataFromApp = this.app.iocContext.get<any>(classType);
            if (!dataFromApp) {
              throw new Error(`No class [${classType}] found from AppIOC, from param: [${from}].`);
            }
            if (!isClass(dataFromApp)) {
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

            let dataType = this.app.iocContext.get<any>(classType);
            if (!dataType) {
              throw new Error(`No class [${classType}] found from AppIOC, from param: [${from}].`);
            }
            if (!isClass(dataType)) {
              dataType = dataType.constructor;
            }
            if (!this.ctx) {
              throw new Error(`Inject from Context, [${getGlobalType(this.constructor)}] MUST in Context.`);
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

export function loadFromApp(classType?: any) {
  return lazyInject('Application', classType);
}

export function loadFromCtx(classType?: any) {
  return lazyInject('Context', classType);
}
