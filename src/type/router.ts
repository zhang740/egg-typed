import 'reflect-metadata';
import { getGlobalType } from 'power-di/utils';
import { Controller } from './controller';
import { Context } from './base_context_class';

const routes: RouterType[] = [];

export type MethodType =
  // from utils.methods
  'head' | 'options' | 'get' | 'put' | 'patch' | 'post' | 'delete' |
  // from egg
  'all' | 'resources' | 'register' | 'redirect';

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
  paramTypes: { [key: string]: any };
  returnType: any;
  call?: (ctx: Context) => any;
}

const methods: MethodType[] = ['get', 'put', 'post', 'delete', 'patch'];
function getNameAndMethod(functionName: string) {
  let name = functionName, functionMethod: MethodType = 'get';
  functionName = functionName.toLowerCase();

  for (let i = 0; i < methods.length; i++) {
    const method = methods[i];
    if (functionName.startsWith(method)) {
      name = functionName.substring(3);
      functionMethod = method;
      break;
    }
  }

  return { name, method: functionMethod };
}

const COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const DEFAULT_PARAMS = /=[^,]+/mg;
const FAT_ARROWS = /=>.*$/mg;

function getParameterNames(fn: Function) {
  let code = fn.toString()
    .replace(COMMENTS, '')
    .replace(FAT_ARROWS, '')
    .replace(DEFAULT_PARAMS, '');

  let result = code
    .slice(code.indexOf('(') + 1, code.indexOf(')'))
    .match(/([^\s,]+)/g);

  return result === null
    ? []
    : result;
}

export function routerMetadata(data: RouterMetadataType): any {
  return function (target: any, key: string, descriptor: TypedPropertyDescriptor<any>) {
    const typeGlobalName = getGlobalType(target.constructor);

    const typeInfo: RouterType = {
      ...data,
      typeGlobalName,
      typeClass: target.constructor,
      paramTypes: Reflect.getMetadata('design:paramtypes', target, key),
      returnType: Reflect.getMetadata('design:returntype', target, key),
    };

    typeInfo.functionName = key;
    if (!typeInfo.url) {
      const ctrl = typeGlobalName
        .split('_')[0]
        .toLowerCase()
        .replace('controller', '');
      let nm = getNameAndMethod(typeInfo.functionName);
      typeInfo.url = `/${ctrl}/${nm.name}`;
      typeInfo.method = nm.method;
    }
    routes.push(typeInfo);

    const CtrlType = typeInfo.typeClass;
    const routerFn: Function = target[key];
    const params = getParameterNames(routerFn);

    const getArgs = (ctx: Context) => {
      return params.map(p => {
        const param = ctx.params || {};
        const query = ctx.query || {};
        const body = (ctx.request || {} as any).body || {};
        return param[p] || query[p] || body[p] || undefined;
      });
    };

    typeInfo.call = function (this: undefined, ctx: Context) {
      const ctrl = new CtrlType(ctx);
      const args = getArgs(ctx);
      return routerFn.apply(ctrl, args);
    };

    return {
      value: typeInfo.call
    };
  };
}

export function getRouters() {
  return routes;
}
