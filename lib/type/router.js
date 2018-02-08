"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const utils_1 = require("power-di/utils");
const routes = [];
const methods = ['get', 'put', 'post', 'delete', 'patch'];
function getNameAndMethod(functionName) {
    let name = functionName, functionMethod = 'get';
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
function getParameterNames(fn) {
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
function routerMetadata(data = {}) {
    return function (target, key) {
        const typeGlobalName = utils_1.getGlobalType(target.constructor);
        const CtrlType = target.constructor;
        const routerFn = target[key];
        const paramTypes = Reflect.getMetadata('design:paramtypes', target, key);
        const typeInfo = {
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
        const getArgs = (ctx) => {
            return typeInfo.paramTypes.map(p => {
                const name = p.name;
                const param = ctx.params || {};
                const query = ctx.query || {};
                const body = (ctx.request || {}).body || {};
                return param[name] || query[name] || body[name] || undefined;
            });
        };
        const call = async function (ctx) {
            const ctrl = new CtrlType(ctx);
            const args = getArgs(ctx);
            const ret = await Promise.resolve(routerFn.apply(ctrl, args));
            ctx.body = ret;
            return ret;
        };
        typeInfo.call = () => target[key];
        return {
            value: call
        };
    };
}
exports.routerMetadata = routerMetadata;
function getRouters() {
    return routes;
}
exports.getRouters = getRouters;
