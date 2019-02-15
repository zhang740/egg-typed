'use strict';

import AppWorkerLoader from './app_worker_loader';
import AgentWorkerLoader from './agent_worker_loader';
import * as path from 'path';
export const egg = require('egg');
export const EGG_PATH = Symbol.for('egg#eggPath');
export const EGG_LOADER = Symbol.for('egg#loader');
const startCluster = egg.startCluster;

import { IocContext } from 'power-di';

export const EGGApplication = egg.Application as ObjectConstructor;

export class Application extends EGGApplication {
  public iocContext: IocContext;

  public config: any;

  constructor(options: any) {
    super(options);
  }

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
  get [EGG_LOADER]() {
    return AgentWorkerLoader;
  }

  constructor(options: any) {
    super(options);
  }
}

export {
  AppWorkerLoader,
  AgentWorkerLoader,
  startCluster,
};
