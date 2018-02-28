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

export interface RouterMetadataType<ExtType = any> {
  name?: string;
  method?: MethodType;
  url?: string | RegExp | string[] | RegExp[] | ((app: Application) => string);
  descrption?: string;
  beforeMiddleware?: GetMiddlewareType[];
  afterMiddleware?: GetMiddlewareType[];
  extInfo?: ExtType;
  onError?: (ctx: Context, error: Error) => void;
}

export type GetMiddlewareType = (app: Application) => (Function | Function[]);

export interface RouterType<ExtType = any> extends RouterMetadataType<ExtType> {
  typeClass: any;
  typeGlobalName: string;
  functionName: string;
  paramTypes: { name: string, type: any }[];
  returnType: any;
  call: () => (ctx: Context) => any;
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
// TS_TO_ES6
const ASYNC_DEFAULT_PARAMS = ', void 0, void 0, function* (';

function getParameterNames(fn: Function) {
  let code = fn.toString()
    .replace(ASYNC_DEFAULT_PARAMS, '')
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
  return extRules[ruleKey];
}

// #region ParameterDecorator
export function FromCustom(custom: (ctx: Context, name: string) => any): ParameterDecorator {
  return (target, key, index) => {
    const methodRule = getMethodRules(target, key as string);
    methodRule.param[index] = custom;
  };
}
export function FromBody(paramName?: string): ParameterDecorator {
  return FromCustom(
    (ctx: Context, name: string) => (ctx.request.body as any)[paramName || name],
  );
}
export function FromParam(paramName?: string): ParameterDecorator {
  return FromCustom(
    (ctx: Context, name: string) => (ctx.params as any)[paramName || name],
  );
}
export function FromQuery(paramName?: string): ParameterDecorator {
  return FromCustom(
    (ctx: Context, name: string) => (ctx.query as any)[paramName || name],
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

export function routerMetadata<T = any>(data: RouterMetadataType<T> = {}): MethodDecorator {
  return function (target: any, key: string) {
    const typeGlobalName = getGlobalType(target.constructor);
    const CtrlType = target.constructor;
    const routerFn: Function = target[key];

    const paramTypes = Reflect.getMetadata('design:paramtypes', target, key) || [];
    const typeInfo: RouterType = {
      onError: function (ctx, err) {
        ctx.throw(err);
      },
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
      beforeMiddleware: (data.beforeMiddleware || []).concat(beforeMiddlewares[getRuleKey(target, key)] || []),
      afterMiddleware: (data.afterMiddleware || []).concat(afterMiddlewares[getRuleKey(target, key)] || []),
      call: () => target[key],
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
        let argValue = undefined;

        if (methodRules.param[i]) {
          argValue = methodRules.param[i](ctx, name);
        } else {
          const param = ctx.params || {};
          const query = ctx.query || {};
          const body = (ctx.request || {} as any).body || {};
          if (name in param) {
            argValue = param[name];
          } else if (name in query) {
            argValue = query[name];
          } else if (name in body) {
            argValue = body[name];
          }
        }

        if (argValue === undefined) {
          return argValue;
        }
        switch (p.type) {
          case Number:
            return parseFloat(argValue);

          case String:
            return `${argValue}`;

          // TODO custom TypeFormatter

          default:
            return argValue;
        }
      });
    };

    return {
      value: async function (this: any, ctx: Context) {
        // 'this' maybe is Controller or Context, in Chair.
        ctx = (this.request && this.response ? this : this.ctx) || ctx;
        const ctrl = new CtrlType(ctx);
        const args = getArgs(ctx);
        try {
          const ret = await Promise.resolve(routerFn.apply(ctrl, args));
          if (ret !== undefined) {
            ctx.body = ret;
          }
          return ret;
        } catch (error) {
          typeInfo.onError(ctx, error);
        }
      }
    } as TypedPropertyDescriptor<any>;
  };
}

export function getRouters<ExtType = any>() {
  return routes as RouterType<ExtType>[];
}
