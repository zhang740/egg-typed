import * as request from 'supertest';
import mm from 'egg-mock';

describe('test/lib/di/index.test.js', () => {
  let app: any;
  before(() => {
    app = mm.app({
      baseDir: 'example',
      customEgg: true,
    } as any);
    return app.ready();
  });

  after(() => app.close());

  afterEach(mm.restore);

  it('a_path', () => {
    return request(app.callback())
      .get('/di/a_path')
      .expect('/di/a_path')
      .expect(200);
  });

  it('b_path', () => {
    return request(app.callback())
      .get('/di/b_path')
      .expect('/di/b_path')
      .expect(200);
  });

  it('b_appname', () => {
    return request(app.callback())
      .get('/di/b_appname')
      .expect('framework-example')
      .expect(200);
  });

});

