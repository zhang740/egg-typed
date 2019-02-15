import { context, register, typeLoader } from 'egg-aop';
import { getGlobalType } from 'power-di/utils';

export * from 'orm-ts';

function getRepositoryKey(modelType: any) {
  return `${getGlobalType(modelType)}@Repository`;
}

function registerRepository(modelType: any, repoType: any) {
  register('Context', repoType, getRepositoryKey(modelType))(repoType);
}

export function repository(modelType: any) {
  return (target: any) => {
    registerRepository(modelType, target);
  };
}

//#region 添加MySQL提供程序
import * as co from 'co';
import { getInstance } from 'egg-aop';
import { IProvider, BaseRepository } from 'orm-ts';

let BaseRepositoryType = BaseRepository;

export function setBaseRepository(target: any) {
  BaseRepositoryType = target;
}

@context(IProvider)
export class MySQLProvider<T> implements IProvider<T> {

  constructor(
    protected ctx: any
  ) {
  }

  getRepositoryByModelClass(modelType: any): BaseRepository {
    if (!modelType) {
      throw new Error('No modelType!');
    }
    const ormConfig = this.ctx.app.config.orm;
    const key = getRepositoryKey(modelType);
    if (!typeLoader.has(key)) {
      class TmpRepository extends BaseRepositoryType {
        constructor() {
          super(modelType, ormConfig);
        }
      }
      registerRepository(modelType, TmpRepository);
      return this.getRepositoryByModelClass(modelType);
    }
    return getInstance(key, this.ctx.app, this.ctx);
  }

  private get mysql() {
    return this.ctx._transactionConnection || (this.ctx.app as any).mysql;
  }

  async queryOne(sql: string, params?: any): Promise<T> {
    return await co(this.mysql.queryOne(sql, params));
  }

  async query(sql: string, params?: any): Promise<T[]> {
    return await co(this.mysql.query(sql, params));
  }
}
//#endregion
