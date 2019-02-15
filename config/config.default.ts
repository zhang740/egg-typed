'use strict';
import * as path from 'path';

module.exports = (appInfo: any) => {

  return {
    et: {
      useTracking: false,
      useMetaApi: false,

      autoLoadDir: true,
      useTSRuntime: false,
      excludeDir: [
        'web',
        'assets',
        'view',
        'template',
        'public',
        'test',
        'plugins',
        'proxy-class',
        'proxy-enums',
      ],
      metaPath: '/$metadata',
      /** 场景测试 */
      sceneTest: {
        /** 基础目录 */
        basePath: path.join('test', 'scene'),
        /** 跟踪数据保存黑名单 */
        trackingSaveBlackList: [
          /MemoryCache/,
          /BaseRepository_/,
          /MySQLProvider\.getRepositoryByModelClass/,
        ] as RegExp[],
        /** 跟踪数据保存白名单 */
        trackingSaveWhiteList: [
        ] as RegExp[]
      },
      /** UI 测试 */
      uiTest: {
        basePath: path.join('test', 'uitest'),
      }
    },
    aop: {
      useCtxProxyForAppComponent: false,
      autoRegisterToCtx: true,
    },
    orm: {
      useCache: true,
    },
    customLogger: {
      error: {
        file: path.join(appInfo.root, `logs/${appInfo.name}/bizlogger/error.log`),
      }
    }
  };
};
