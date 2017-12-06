import 'reflect-metadata';
import { Context } from './base_context_class';
export declare type MethodType = 'head' | 'options' | 'get' | 'put' | 'patch' | 'post' | 'delete' | 'all' | 'resources' | 'register' | 'redirect';
export interface RouterMetadataType {
    name?: string;
    method?: MethodType;
    url?: string | RegExp | string[] | RegExp[];
    descrption?: string;
}
export interface RouterType extends RouterMetadataType {
    typeClass: any;
    typeGlobalName: string;
    functionName?: string;
    paramTypes: {
        [key: string]: any;
    };
    returnType: any;
    call?: (ctx: Context) => any;
}
export declare function routerMetadata(data: RouterMetadataType): any;
export declare function getRouters(): RouterType[];
