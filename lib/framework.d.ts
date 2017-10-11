import AppWorkerLoader from './app_worker_loader';
declare const AgentWorkerLoader: any;
declare const startCluster: any;
import { Service } from '../type/service';
import { IocContext } from 'power-di';
export declare const EGGApplication: ObjectConstructor;
export declare const EGGAgent: ObjectConstructor;
export declare class Application extends EGGApplication {
    iocContext: IocContext;
    GetService<T>(serviceType: typeof Service): T;
}
declare module 'egg' {
    interface Application {
        iocContext: IocContext;
        GetService<T>(serviceType: typeof Service): T;
    }
}
export declare class Agent extends EGGAgent {
}
export { AppWorkerLoader, AgentWorkerLoader, startCluster };
