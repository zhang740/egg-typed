/**
 * lazy inject, use for Controller/Service/Any other BaseContextClass
 * This can new Class and inject app/ctx (need from ctx)
 * @param type class or string
 */
export declare function lazyInject(from: 'Application' | 'Context', classType?: any): any;
export declare function lazyInjectFromApp(classType?: any): any;
export declare function lazyInjectFromCtx(classType?: any): any;
