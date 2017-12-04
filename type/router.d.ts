export declare type MethodType = 'head' | 'options' | 'get' | 'put' | 'patch' | 'post' | 'delete' | 'all' | 'resources' | 'register' | 'redirect';
export interface RouterMetadataType {
    name?: string;
    method?: MethodType;
    url?: string | RegExp | string[] | RegExp[];
    descrption?: string;
}
export interface RouterType extends RouterMetadataType {
    type?: string;
    functionName?: string;
}
export declare function routerMetadata(data: RouterMetadataType): any;
export declare function getRouters(): RouterType[];
