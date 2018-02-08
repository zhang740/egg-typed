import {
  Service as BaseService,
  Application as EggApplication,
} from './base';
import { IocContext } from 'power-di';
import { Application } from '../framework';

const services: ServiceType[] = [];

export interface ServiceConfig {
}
export abstract class Service extends BaseService {
  app: EggApplication & Application;

  public GetComponent<T>(classType: any) {
    const context = this.ctx.iocContext as IocContext;
    return context.get<T>(classType);
  }
}

export interface ServiceMetadataType {
  name?: string;
  config?: ServiceConfig;
}

export interface ServiceType extends ServiceMetadataType {
  classConstructor: ObjectConstructor;
}

export function serviceMetadata(data: ServiceMetadataType = {}): any {
  // const config = data.config || {};

  return function (target: any) {
    services.push({
      ...data,
      classConstructor: target,
    });
  };
}

export function componentMetadata(data: ServiceMetadataType = {}): any {
  return serviceMetadata(data);
}

export function getServices() {
  return services;
}
