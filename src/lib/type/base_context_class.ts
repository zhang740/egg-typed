import {
  BaseContextClass as EggBCC,
  Application as EggApplication,
  Context
} from 'egg';
import { Application } from '../framework';

export { Context };

export class BaseContextClass extends EggBCC {
  app: EggApplication & Application;
}
