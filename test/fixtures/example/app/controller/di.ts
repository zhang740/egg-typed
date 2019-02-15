import { lazyInject } from '../../../../../di';
import { AService } from '../service/a';
import { BService, B2Service } from '../service/b';
import { route } from '../../../../../lib';

export class DIController {

  @lazyInject()
  private aService: AService;
  @lazyInject()
  private bService: BService;
  @lazyInject()
  private b2Service: B2Service;

  @route()
  a_path() {
    return this.aService.getCtxPath();
  }

  @route()
  b_path() {
    return this.bService.getCtxPath();
  }

  @route()
  b_appname() {
    return this.b2Service.getAppName();
  }

}
