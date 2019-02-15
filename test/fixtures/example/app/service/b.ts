import { Service, Context } from '../../../../../lib';

// 强依赖ctx

export class BService extends Service {
  getCtxPath() {
    return this.ctx.path;
  }
}

// 有限依赖ctx

export class B2Service {

  private appName: string;

  constructor(ctx: Context) {
    this.appName = ctx.app.config.name;
  }

  getAppName() {
    return this.appName;
  }
}
