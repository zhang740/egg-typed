import { Service as BaseService, Application as EggApplication } from './base';
import { Application } from '../framework';
export interface ServiceConfig {
}
export declare abstract class Service extends BaseService {
    app: EggApplication & Application;
    GetComponent<T>(classType: any): T;
}
export interface ServiceMetadataType {
    name?: string;
    config?: ServiceConfig;
}
export interface ServiceType extends ServiceMetadataType {
    classConstructor: ObjectConstructor;
}
export declare function serviceMetadata(data?: ServiceMetadataType): any;
export declare function getServices(): ServiceType[];
