import * as koa from '@types/koa';
import { Application } from '../lib/framework';

export type Context = koa.Context;
export class BaseContextClass {
    protected ctx: koa.Context;
    protected app: Application;
    protected config: any;
    protected service: any;

    constructor(ctx: koa.Context) {
        this.ctx = ctx;
        this.app = ctx.app as any;
        this.config = (ctx.app as any).config;
        this.service = (ctx as any).service;
    }
}