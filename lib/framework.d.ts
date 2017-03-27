import AppWorkerLoader from './app_worker_loader';
declare const AgentWorkerLoader: any;
declare const startCluster: any;
export declare const EGGApplication: ObjectConstructor;
export declare const EGGAgent: ObjectConstructor;
export declare class Application extends EGGApplication {
}
export declare class Agent extends EGGAgent {
}
export { AppWorkerLoader, AgentWorkerLoader, startCluster };
