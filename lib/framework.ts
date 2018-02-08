'use strict';

import AppWorkerLoader from './app_worker_loader';
import * as path from 'path';
export const egg = require('egg');
export const EGG_PATH = Symbol.for('egg#eggPath');
export const EGG_LOADER = Symbol.for('egg#loader');
const AgentWorkerLoader = egg.AgentWorkerLoader;
const startCluster = egg.startCluster;

import { IocContext } from 'power-di';

export class Application extends egg.Application {

  public iocContext: IocContext;

  get [EGG_PATH]() {
    return path.dirname(__dirname);
  }
  get [EGG_LOADER]() {
    return AppWorkerLoader;
  }

  public GetComponent<T>(classType: any) {
    const context = this.iocContext as IocContext;
    return context.get<T>(classType);
  }
}

export const EGGAgent = egg.Agent as ObjectConstructor;

export class Agent extends EGGAgent {
  get [EGG_PATH]() {
    return path.dirname(__dirname);
  }
}

export {
  AppWorkerLoader,
  AgentWorkerLoader,
  startCluster,
};
