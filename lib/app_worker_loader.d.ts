import { Application as EggApplication } from 'egg';
import { Application } from './framework';
declare const EggLoader: ObjectConstructor;
export { EggLoader };
export default class AppWorkerLoader extends EggLoader {
    app: EggApplication & Application;
    /**
     * 开始加载所有约定目录
     * @since 1.0.0
     */
    load(): void;
    loadDir(dirPath: string): void;
    loadApp(): void;
    registerServiceToIOC(): void;
    registerRouter(): void;
}
