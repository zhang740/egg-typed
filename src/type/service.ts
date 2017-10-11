import { Service as BaseService, Context } from 'egg';
import { IocContext } from 'power-di';

export interface ServiceConfig {
  /** singleton, default: false */
  singleton?: boolean;
}
export class Service extends BaseService {
  constructor(ctx: Context, config: ServiceConfig = {
    singleton: false
  }) {
    super(ctx);
    const context = this.app.iocContext as IocContext || IocContext.DefaultInstance;
    if (!(this.constructor as any).__type) {
      context.register(this, this.constructor, {
        singleton: config.singleton
      });
    }
  }
}
