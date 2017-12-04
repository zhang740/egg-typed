import { Controller as EggController, Application as EggApplication } from 'egg';
import { Application } from '../lib/framework';
export declare abstract class Controller extends EggController {
    app: EggApplication & Application;
    getByIOC(classType: any): {};
}
