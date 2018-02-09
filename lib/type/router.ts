import 'reflect-metadata';
import { getGlobalType } from 'power-di/utils';
import { Context } from './base_context_class';
import { Application } from '../framework';

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

export type GetMiddlewareType = (app: Application) => (Function | Function[]);

export interface RouterType extends RouterMetadataType {
  typeClass: any;
  typeGlobalName: string;
  functionName: string;
  paramTypes: { name: string, type: any }[];
  returnType: any;
  call: () => (ctx: Context) => any;
  beforeMiddleware: GetMiddlewareType[];
  afterMiddleware: GetMiddlewareType[];
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

const extRules: {
  [typeKey: string]: {
    param: {
      [index: string]: (ctx: Context, name: string) => any;
    };
  }
} = {};

const getRuleKey = (target: any, key: any) => `${getGlobalType(target.constructor)}_${key}`;

function getMethodRules(target: any, key: string) {
  const ruleKey = getRuleKey(target, key);
  if (!extRules[ruleKey]) {
    extRules[ruleKey] = {
      param: {},
    };
  }
  return extRules[key];
}

// #region ParameterDecorator
export function FromCustom(custom: (ctx: Context, name: string) => any, paramName?: string): ParameterDecorator {
  return (target, key, index) => {
    const methodRule = getMethodRules(target, key as string);
    methodRule.param[paramName || index] = custom;
  };
}
export function FromBody(paramName?: string): ParameterDecorator {
  return FromCustom(
    (ctx: Context, name: string) => (ctx.request.body as any)[name],
    paramName
  );
}
export function FromParam(paramName?: string): ParameterDecorator {
  return FromCustom(
    (ctx: Context, name: string) => (ctx.params as any)[name],
    paramName
  );
}
export function FromQuery(paramName?: string): ParameterDecorator {
  return FromCustom(
    (ctx: Context, name: string) => (ctx.query as any)[name],
    paramName
  );
}
// #endregion

// #region Controller Middleware
const beforeMiddlewares: {
  [key: string]: GetMiddlewareType[],
} = {};
const afterMiddlewares: {
  [key: string]: GetMiddlewareType[],
} = {};
export function beforeMiddware(middwares: GetMiddlewareType | GetMiddlewareType[]): MethodDecorator {
  middwares = [].concat(middwares);
  return (target, key) => {
    const typeGlobalName = getGlobalType(target.constructor);
    const route = routes.find(r => r.typeGlobalName === typeGlobalName && r.functionName === key);
    if (route) {
      route.beforeMiddleware.concat(middwares);
    } else {
      beforeMiddlewares[getRuleKey(target, key)] = middwares as GetMiddlewareType[];
    }
  };
}
export function afterMiddware(middwares: GetMiddlewareType | GetMiddlewareType[]): MethodDecorator {
  middwares = [].concat(middwares);
  return (target, key) => {
    const typeGlobalName = getGlobalType(target.constructor);
    const route = routes.find(r => r.typeGlobalName === typeGlobalName && r.functionName === key);
    if (route) {
      route.afterMiddleware.concat(middwares);
    } else {
      afterMiddlewares[getRuleKey(target, key)] = middwares as GetMiddlewareType[];
    }
  };
}
// #endregion

export function routerMetadata(data: RouterMetadataType = {}): MethodDecorator {
  return function (target: any, key: string) {
    const typeGlobalName = getGlobalType(target.constructor);
    const CtrlType = target.constructor;
    const routerFn: Function = target[key];

    const paramTypes = Reflect.getMetadata('design:paramtypes', target, key);
    const typeInfo: RouterType = {
      ...data,
      typeGlobalName,
      typeClass: CtrlType,
      functionName: key,
      paramTypes: getParameterNames(routerFn).map((name, i) => {
        return {
          name,
          type: paramTypes[i],
        };
      }),
      returnType: Reflect.getMetadata('design:returntype', target, key),
      beforeMiddleware: beforeMiddlewares[getRuleKey(target, key)] || [],
      afterMiddleware: afterMiddlewares[getRuleKey(target, key)] || [],
      call: () => () => { },
    };

    let name = getNameAndMethod(typeInfo.functionName);
    if (!typeInfo.url) {
      const ctrl = typeGlobalName
        .split('_')[0]
        .toLowerCase()
        .replace('controller', '');
      typeInfo.url = `/${ctrl}/${name.name}`;
    }
    if (!typeInfo.method) {
      typeInfo.method = name.method;
    }
    routes.push(typeInfo);

    const methodRules = getMethodRules(target, key);

    const getArgs = (ctx: Context) => {
      return typeInfo.paramTypes.map((p, i) => {
        const name = p.name;

        if (methodRules.param[i]) {
          return methodRules.param[i](ctx, name);
        }

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
      try {
        const ret = await Promise.resolve(routerFn.apply(ctrl, args));
        if (ret !== undefined) {
          context.body = ret;
        }
        return ret;
      } catch (error) {
        this.throw(error, 400);
      }
    };

    typeInfo.call = () => target[key];

    return {
      value: call
    } as TypedPropertyDescriptor<any>;
  };
}

export function getRouters() {
  return routes;
}
