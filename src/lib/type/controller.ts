import { Controller as EggController, Application as EggApplication } from 'egg';
import { Application } from '../framework';

export abstract class Controller extends EggController {
  app: EggApplication & Application;
  getByIOC(classType: any) {
    return this.app.iocContext.get(classType);
  }
}
