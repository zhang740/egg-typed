import {
  Service as BaseService,
  Application as EggApplication,
  Context,
} from 'egg';
import { IocContext } from 'power-di';
import { Application } from '../lib/framework';

const services: ServiceType[] = [];

export interface ServiceConfig {
}
export abstract class Service extends BaseService {
  app: EggApplication & Application;
}

export interface ServiceMetadataType {
  name?: string;
  config?: ServiceConfig;
}

export interface ServiceType extends ServiceMetadataType {
  classConstructor: ObjectConstructor;
}

export function serviceMetadata(data: ServiceMetadataType = {}): any {
  const config = data.config || {};

  return function (target: any) {
    services.push({
      ...data,
      classConstructor: target,
    });
  };
}

export function getServices() {
  return services;
}
