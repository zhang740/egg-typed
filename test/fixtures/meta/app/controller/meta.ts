import { route } from '../../../../../lib';

export class MetaController {

  @route({ url: '/meta/index', name: '首页' })
  async index(id: string, n: number, e: 'enumA' | 'enumB', d: Date) {
    return 'metaIndex';
  }

  @route('/meta/sort', { name: '简写' })
  async sort() {
    return 'metaSort';
  }

  @route('/meta/post', { name: 'post' })
  async postData(param: any) {
    return param;
  }

  @route('/meta/put', { name: 'put' })
  async put(id: number) {
    return id;
  }

}
