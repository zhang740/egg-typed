import 'reflect-metadata';
import { getGlobalType } from 'power-di/utils';
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
  paramTypes: { name: string, type: any }[];
  returnType: any;
  call?: () => (ctx: Context) => any;
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

export function routerMetadata(data: RouterMetadataType = {}): any {
  return function (target: any, key: string) {
    const typeGlobalName = getGlobalType(target.constructor);
    const CtrlType = target.constructor;
    const routerFn: Function = target[key];

    const paramTypes = Reflect.getMetadata('design:paramtypes', target, key);
    const typeInfo: RouterType = {
      ...data,
      typeGlobalName,
      typeClass: CtrlType,
      paramTypes: getParameterNames(routerFn).map((name, i) => {
        return {
          name,
          type: paramTypes[i]
        };
      }),
      returnType: Reflect.getMetadata('design:returntype', target, key),
    };

    typeInfo.functionName = key;

    let nm = getNameAndMethod(typeInfo.functionName);
    if (!typeInfo.url) {
      const ctrl = typeGlobalName
        .split('_')[0]
        .toLowerCase()
        .replace('controller', '');
      typeInfo.url = `/${ctrl}/${nm.name}`;
    }
    if (!typeInfo.method) {
      typeInfo.method = nm.method;
    }
    routes.push(typeInfo);

    const getArgs = (ctx: Context) => {
      return typeInfo.paramTypes.map(p => {
        const name = p.name;
        const param = ctx.params || {};
        const query = ctx.query || {};
        const body = (ctx.request || {} as any).body || {};
        return param[name] || query[name] || body[name] || undefined;
      });
    };

    const call = async function (this: Context, ctx: Context) {
      const context = this || ctx;
      const ctrl = new CtrlType(context);
      const args = getArgs(context);
      const ret = await Promise.resolve(routerFn.apply(ctrl, args));
      context.body = ret;
      return ret;
    };

    typeInfo.call = () => target[key];

    return {
      value: call
    };
  };
}

export function getRouters() {
  return routes;
}
