/// <reference types="koa" />
import * as koa from '@types/koa';
import { Application } from '../lib/framework';
export declare type Context = koa.Context;
export declare class BaseContextClass {
    protected ctx: koa.Context;
    protected app: Application;
    protected config: any;
    protected service: any;
    constructor(ctx: koa.Context);
}
