'use strict';

module.exports = () => {

  return {
    et: {
      useTracking: true,
      useMetaApi: true,
    },
    aop: {
      useCtxProxyForAppComponent: true,
    },
    controller: {
      genSDK: {
        enable: true,
      },
    },
  };
};
