/// <reference types="koa" />
import * as koa from '@types/koa';
export declare class Controller {
    protected ctx: koa.Context;
    protected app: any;
    protected config: any;
    protected service: any;
    constructor(ctx: koa.Context);
}
