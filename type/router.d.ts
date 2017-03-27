export interface RouterMetadataType {
    name?: string;
    method?: 'head' | 'options' | 'get' | 'put' | 'patch' | 'post' | 'delete' | 'all' | 'resources' | 'register' | 'redirect';
    url: string | RegExp | string[] | RegExp[];
    descrption?: string;
    type?: string;
    functionName?: string;
}
export declare function routerMetadata(data: RouterMetadataType): any;
export declare function getRouters(): RouterMetadataType[];
