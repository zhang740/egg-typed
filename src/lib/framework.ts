'use strict';

import AppWorkerLoader from './app_worker_loader';
const path = require('path');
const egg = require('egg');
const EGG_PATH = Symbol.for('egg#eggPath');
const EGG_LOADER = Symbol.for('egg#loader');
const AgentWorkerLoader = egg.AgentWorkerLoader;
const startCluster = egg.startCluster;

export const EGGApplication = egg.Application as ObjectConstructor;
export const EGGAgent = egg.Agent as ObjectConstructor;

export class Application extends EGGApplication {
  get [EGG_PATH]() {
    return path.dirname(__dirname);
  }
  get [EGG_LOADER]() {
    return AppWorkerLoader;
  }
}

export class Agent extends EGGAgent {
  get [EGG_PATH]() {
    return path.dirname(__dirname);
  }
}

export {
  AppWorkerLoader,
  AgentWorkerLoader,
  startCluster,
}