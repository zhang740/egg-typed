import { getGlobalType } from 'power-di/utils';
import { Controller } from './controller';

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
  type?: string;
  functionName?: string;
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

const ET_PARAMS = 'ET_PARAMS';

export function routerMetadata(data: RouterMetadataType): any {
  return function (target: any, key: string, descriptor: TypedPropertyDescriptor<any>) {
    const typeInfo: RouterType = {
      ...data
    };

    typeInfo.type = getGlobalType(target.constructor).split('_')[0];
    typeInfo.type = typeInfo.type[0].toLowerCase() + typeInfo.type.substring(1);
    typeInfo.functionName = key;
    if (!typeInfo.url) {
      let ctrl = typeInfo.type.toLowerCase();
      ctrl = ctrl.replace('controller', '');
      let nm = getNameAndMethod(typeInfo.functionName);
      typeInfo.url = `/${ctrl}/${nm.name}`;
      typeInfo.method = nm.method;
    }
    routes.push(typeInfo);

    const routerFn: Function = target[key];
    const params = getParameterNames(routerFn);

    return {
      value: function (this: Controller) {
        const args = params.map(p => {
          const param = this.ctx.params || {};
          const query = this.ctx.query || {};
          const body = (this.ctx.request || {} as any).body || {};
          return param[p] || query[p] || body[p] || undefined;
        });
        return routerFn.apply(this, args.length ? args : arguments);
      }
    };
  };
}

export function getRouters() {
  return routes;
}
