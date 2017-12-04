import AppWorkerLoader from './app_worker_loader';
export declare const egg: any;
declare const AgentWorkerLoader: any;
declare const startCluster: any;
import { Service } from '../type/service';
import { IocContext } from 'power-di';
export declare class Application extends egg.Application {
    readonly iocContext: IocContext;
    GetService<T>(serviceType: typeof Service): T;
}
export declare const EGGAgent: ObjectConstructor;
export declare class Agent extends EGGAgent {
}
export { AppWorkerLoader, AgentWorkerLoader, startCluster };
