import AppWorkerLoader from './app_worker_loader';
export declare const egg: any;
export declare const EGG_PATH: unique symbol;
export declare const EGG_LOADER: unique symbol;
declare const AgentWorkerLoader: any;
declare const startCluster: any;
import { IocContext } from 'power-di';
export declare class Application extends egg.Application {
    iocContext: IocContext;
    readonly [EGG_PATH]: string;
    readonly [EGG_LOADER]: typeof AppWorkerLoader;
    GetComponent<T>(classType: any): T;
}
export declare const EGGAgent: ObjectConstructor;
export declare class Agent extends EGGAgent {
    readonly [EGG_PATH]: string;
}
export { AppWorkerLoader, AgentWorkerLoader, startCluster };
