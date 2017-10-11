import { Service as BaseService, Context } from 'egg';
export interface ServiceConfig {
    /** singleton, default: false */
    singleton?: boolean;
}
export declare class Service extends BaseService {
    constructor(ctx: Context, config?: ServiceConfig);
}
