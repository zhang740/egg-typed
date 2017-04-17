import * as koa from '@types/koa';
import { BaseContextClass } from './base_context_class';
import { IocContext } from 'power-di';

export interface ServiceConfig {
    /** singleton, default: false */
    singleton?: boolean;
}
export class Service extends BaseContextClass {
    constructor(ctx: koa.Context, config: ServiceConfig = {
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