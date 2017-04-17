/// <reference types="koa" />
import * as koa from '@types/koa';
import { BaseContextClass } from './base_context_class';
export interface ServiceConfig {
    /** singleton, default: false */
    singleton?: boolean;
}
export declare class Service extends BaseContextClass {
    constructor(ctx: koa.Context, config?: ServiceConfig);
}
