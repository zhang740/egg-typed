import { BaseContextClass } from './base_context_class';
import { Service } from './service';
import { IocContext } from 'power-di';

export class Controller extends BaseContextClass {

    protected GetService<T>(serviceType: typeof Service) {
        const context = this.app.iocContext as IocContext || IocContext.DefaultInstance;
        return context.get<T>(serviceType);
    }
}