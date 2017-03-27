declare const EggLoader: ObjectConstructor;
export { EggLoader };
export default class AppWorkerLoader extends EggLoader {
    /**
     * 开始加载所有约定目录
     * @since 1.0.0
     */
    load(): void;
    loadRouterByController(): void;
}
