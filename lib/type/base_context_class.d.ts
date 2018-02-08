import { BaseContextClass as EggBCC, Application as EggApplication, Context } from './base';
import { Application } from '../framework';
export { Context };
export declare class BaseContextClass extends EggBCC {
    app: EggApplication & Application;
    GetComponent<T>(classType: any): T;
}
