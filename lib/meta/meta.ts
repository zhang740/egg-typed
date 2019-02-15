import { getGlobalType, getRefMap } from 'power-di/lib/utils';
import { getTrackingDatas, TrackData } from 'egg-typed-tracking';
import { getRoutes, MethodType } from 'egg-controller';
import { EggAppConfig } from 'egg';

export { TrackData };

export interface RouterMetadataType {
  name?: string;
  functionName?: string;
  typeGlobalName?: string;
  method?: MethodType[];
  url?: string | RegExp | string[] | RegExp[];
  description?: string;
  paramTypes: { name: string, type: string, hidden: boolean }[];
  returnType: string;
}

export class Config {
  config?: EggAppConfig;
  showHiddenParam?: boolean = true;
}

export function getApiMetadata({ config, showHiddenParam } = new Config) {
  const ctrls: { [key: string]: RouterMetadataType[] } = {};
  getRoutes(config).forEach(route => {
    const ctrlName = route.typeGlobalName;

    let ctrl = ctrls[ctrlName];
    if (!ctrl) {
      ctrl = ctrls[ctrlName] = [];
    }

    ctrl.push({
      name: route.name,
      functionName: route.functionName,
      typeGlobalName: route.typeGlobalName,
      description: route.description,
      method: [].concat(route.method),
      url: [].concat(
        route.url instanceof Function ?
          config ? route.url(config) : undefined
          : route.url,
      ),
      paramTypes: (route.paramTypes || [])
        .filter(pt => showHiddenParam || !pt.hidden)
        .map((param) => {
          return {
            name: param.name,
            type: param.type && getGlobalType(param.type),
            hidden: param.hidden,
          };
        }),
      returnType: route.returnType && getGlobalType(route.returnType),
    });
  });

  return ctrls;
}

export function getRefMapMetadata(config: EggAppConfig) {
  return getRoutes(config).reduce((prev, current) => {
    return getRefMap(current.typeClass, prev);
  }, {});
}

export function getTrackingMetadata() {
  return getTrackingDatas().sort((a, b) => b.time - a.time);
}
