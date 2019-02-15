import { lazyInject } from '../../../../../di';
import { BService } from './b';

export class AService {

  @lazyInject()
  private bService: BService;

  getCtxPath() {
    return this.bService.getCtxPath();
  }
}
