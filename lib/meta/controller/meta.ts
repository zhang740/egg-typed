import * as path from 'path';
import { Context, Application } from 'egg';
import { route } from 'egg-controller';
import { clearTrackingDatas } from 'egg-typed-tracking';
import { getApiMetadata, getTrackingMetadata, RouterMetadataType, TrackData } from '../../meta';

export class MetadataController {

  private baseDir: string;
  private app: Application;

  constructor(ctx: Context) {
    this.baseDir = ctx.app.baseDir;
    this.app = ctx.app;
  }


  @route({
    url: config => `${(config as any).et.metaPath}/api`,
    name: 'api metadata', description: 'Api接口元数据',
    noTracking: true,
  })
  api() {
    return getApiMetadata({ config: this.app.config, showHiddenParam: false });
  }

  @route({
    url: config => `${(config as any).et.metaPath}/refmap`,
    name: 'refmap metadata', description: '引用元数据',
    noTracking: true,
  })
  refmap() {
    return require(path.join(this.baseDir, 'run', 'ref_map.json'));
  }

  @route({
    url: config => `${(config as any).et.metaPath}/trackdata`,
    name: 'trackdata',
    description: '跟踪元数据',
    noTracking: true,
  })
  tracking(pageNum: number = 1, pageSize: number = 15) {
    const offset = pageSize * (pageNum - 1);
    const dataList = getTrackingMetadata();
    return {
      pagination: {
        pageNum,
        pageSize,
        total: dataList.length,
      },
      dataList: dataList.slice(offset, offset + pageSize)
    };
  }

  @route({
    url: config => `${(config as any).et.metaPath}/trackdata/clear`,
    method: 'post',
    name: 'clear-trackdata',
    description: '清空元数据',
    noTracking: true,
  })
  clearTracking() {
    clearTrackingDatas();
    return true;
  }
}
