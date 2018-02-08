import {
  BaseContextClass as EggBCC,
  Application as EggApplication,
  Context
} from './base';
import { Application } from '../framework';
import { IocContext } from 'power-di';

export { Context };

export class BaseContextClass extends EggBCC {
  app: EggApplication & Application;

  public GetComponent<T>(classType: any) {
    const context = this.ctx.iocContext as IocContext;
    return context.get<T>(classType);
  }
}
