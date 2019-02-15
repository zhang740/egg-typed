import * as path from 'path';
import { Application } from 'egg';

export default (app: Application) => {
  return {
    security: {
      csrf: {
        ignore: [
          '/*'
        ],
        ignoreJSON: false
      }
    },
    controller: {
      genSDK: {
        enable: true,
        filter: [
          /^\/meta\//,
        ]
      }
    }
  };
};
