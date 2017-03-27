import { BaseContextClass } from './base_context_class';
import { Service } from './service';
export declare class Controller extends BaseContextClass {
    protected GetService<T>(serviceType: typeof Service): T;
}
