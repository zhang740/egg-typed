'use strict';

import AppWorkerLoader from './app_worker_loader';
import * as path from 'path';
export const egg = require('egg');
const EGG_PATH = Symbol.for('egg#eggPath');
const EGG_LOADER = Symbol.for('egg#loader');
const AgentWorkerLoader = egg.AgentWorkerLoader;
const startCluster = egg.startCluster;

import { Service } from '../type/service';
import { IocContext } from 'power-di';

export class Application extends egg.Application {

  public get iocContext(): IocContext {
    if (!this._iocContext) {
      this._iocContext = IocContext.DefaultInstance;
    }
    return this._iocContext;
  }

  get [EGG_PATH]() {
    return path.dirname(__dirname);
  }
  get [EGG_LOADER]() {
    return AppWorkerLoader;
  }

  public GetService<T>(serviceType: typeof Service) {
    const context = this.iocContext as IocContext;
    return context.get<T>(serviceType);
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
