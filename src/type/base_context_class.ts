import * as koa from '@types/koa';

export type Context = koa.Context;
export class BaseContextClass {
    protected ctx: koa.Context;
    protected app: any;
    protected config: any;
    protected service: any;

    constructor(ctx: koa.Context) {
        this.ctx = ctx;
        this.app = ctx.app;
        this.config = (ctx.app as any).config;
        this.service = (ctx as any).service;
    }
}