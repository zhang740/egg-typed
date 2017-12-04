"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
const ET_PARAMS = 'ET_PARAMS';
function routerMetadata(data) {
    return function (target, key, descriptor) {
        const typeInfo = Object.assign({}, data);
        typeInfo.type = utils_1.getGlobalType(target.constructor).split('_')[0];
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
        const routerFn = target[key];
        const params = getParameterNames(routerFn);
        return {
            value: function () {
                const args = params.map(p => {
                    const param = this.ctx.params || {};
                    const query = this.ctx.query || {};
                    const body = (this.ctx.request || {}).body || {};
                    return param[p] || query[p] || body[p] || undefined;
                });
                return routerFn.apply(this, args.length ? args : arguments);
            }
        };
    };
}
exports.routerMetadata = routerMetadata;
function getRouters() {
    return routes;
}
exports.getRouters = getRouters;
