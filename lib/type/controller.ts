import { Controller as EggController, Application as EggApplication } from './base';
import { Application } from '../framework';
import { IocContext } from 'power-di';

export abstract class Controller extends EggController {
  app: EggApplication & Application;

  public GetComponent<T>(classType: any) {
    const context = this.ctx.iocContext as IocContext;
    return context.get<T>(classType);
  }
}
