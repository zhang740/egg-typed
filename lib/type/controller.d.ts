import { Controller as EggController, Application as EggApplication } from './base';
import { Application } from '../framework';
export declare abstract class Controller extends EggController {
    app: EggApplication & Application;
    GetComponent<T>(classType: any): T;
}
