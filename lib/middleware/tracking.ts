import { Application, RouteType } from '..';
import { trackExtInfoSymbol } from 'egg-typed-tracking';

export const noTrackingSymbol = Symbol('no-tracking');

// TODO 待分离tracking插件
export const trackingMiddleware = (app: Application, typeInfo: RouteType) => {
  if (app.config.et.useTracking) {
    if (typeInfo.noTracking) {
      return async (ctx: any, next: any) => {
        Object.defineProperty(ctx, noTrackingSymbol, {
          configurable: false,
          enumerable: false,
          value: true
        });
        next();
      };
    } else {
      return async (ctx: any, next: any) => {
        if (!ctx[trackExtInfoSymbol]) {
          ctx[trackExtInfoSymbol] = {};
        }
        const trackData = ctx[trackExtInfoSymbol];
        trackData.originalUrl = ctx.request.originalUrl;
        trackData.path = ctx.request.path;
        trackData.method = ctx.request.method;
        trackData.header = JSON.parse(JSON.stringify(ctx.request.header));
        trackData.params = ctx.request.params;
        trackData.query = ctx.request.query;
        trackData.body = JSON.parse(JSON.stringify(ctx.request.body));
        trackData.route = {
          name: typeInfo.name,
          description: typeInfo.description,
        };

        try {
          await next();

          trackData.trackingId = trackData.header['tracking-id'] || ctx.header['request-id'];
          trackData.result = {
            status: ctx.status,
            body: ctx.body
          };
        } catch (error) {
          trackData.result = {
            status: error.status,
            error: {
              code: error.code,
              message: error.message,
            },
            errStr: error.toString(),
          };
          throw error;
        }

      };
    }
  }
};
