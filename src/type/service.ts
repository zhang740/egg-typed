import * as koa from '@types/koa';
import { BaseContextClass } from './base_context_class';
import { IocContext } from 'power-di';

export class Service extends BaseContextClass {
    constructor(ctx: koa.Context) {
        super(ctx);
        const context = this.app.iocContext as IocContext || IocContext.DefaultInstance;
        context.register(this, this.constructor);
    }
}