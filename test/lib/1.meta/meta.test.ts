'use strict';

import * as fs from 'fs';
import * as path from 'path';
import * as request from 'supertest';
import mm from 'egg-mock';
import * as assert from 'assert';
import { getApiMetadata } from '../../../lib/meta/meta';

describe('test/lib/meta/meta.test.js', () => {
  let app: any;
  before(() => {
    app = mm.app({
      baseDir: 'meta',
      customEgg: true,
    } as any);
    return app.ready();
  });

  after(() => app.close());

  afterEach(mm.restore);

  it('getApiMetadata', () => {
    const metadata = getApiMetadata({ config: app.config });
    // fs.writeFileSync(path.join(__dirname, 'meta.json'), JSON.stringify(metadata, null, 2));
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'meta.json'), 'utf-8'));
    assert.deepEqual(JSON.parse(JSON.stringify(metadata)), data);
  });

});

