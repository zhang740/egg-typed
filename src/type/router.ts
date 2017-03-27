import { getGlobalType } from 'power-di/utils';

const routes: RouterMetadataType[] = [];
export interface RouterMetadataType {
    name?: string;
    method?:
    // from utils.methods
    'head' | 'options' | 'get' | 'put' | 'patch' | 'post' | 'delete' |
    // from egg
    'all' | 'resources' | 'register' | 'redirect';
    url: string | RegExp | string[] | RegExp[];
    descrption?: string;
    type?: string;
    functionName?: string;
}
export function routerMetadata(data: RouterMetadataType): any {
    return function (target: any, key: string, descriptor: TypedPropertyDescriptor<any>) {
        data.type = getGlobalType(target.constructor).split('_')[0].replace('Controller', '').toLowerCase();
        data.functionName = key;
        routes.push(data);
    };
}

export function getRouters() {
    return routes;
}