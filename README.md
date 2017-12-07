# egg-typed

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]

[npm-image]: https://img.shields.io/npm/v/egg-typed.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-typed
[travis-image]: https://img.shields.io/travis/eggjs/egg-typed.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-typed
[codecov-image]: https://codecov.io/github/eggjs/egg-typed/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/eggjs/egg-typed?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-typed.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-typed
[snyk-image]: https://snyk.io/test/npm/egg-typed/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-typed

An onther style (like C#/java) of [egg](https://github.com/eggjs/egg) enterprise app framework.

All files in `app` directory (exclude the directory name is kind of ['view', 'template', 'public']) will load automatically.

Demo: [odux-egg-example](https://github.com/zhang740/odux-egg-example)

## Quick overview

### Controller
```ts
import { Controller, routerMetadata } from 'egg-typed';
import TestService from '../service/Test';

export default class HomeController extends Controller {

  // @lazyInject(TestService)
  @lazyInject() // tsconfig.json -> "emitDecoratorMetadata": true
  testService: TestService;

  private requestInfo(id = 'defaultId') {
    return {
      url: this.ctx.url,
      test_service_name: this.testService.get(id).name,
    };
  }

  @routerMetadata({ url: '/' })
  index() {
      this.ctx.body = 'Hello World';
  }

  @routerMetadata({ url: ['/test', '/test2'] })
  test() {
    this.ctx.body = this.requestInfo();
  }

  // url by contract
  // support prefix: 'get'(default), 'put', 'post', 'delete', 'patch'
  // e.g this url is: '/home/name', method: 'get'
  // 'home' is the name of controller, 'name' is the name of method.
  @routerMetadata()
  getName() {
    this.ctx.body = this.requestInfo();
  }

  // auto fill params, params > query > body
  // e.g request: 
  // /api/params?id=123&code=333
  // /api/params/123?code=333
  @routerMetadata({ name: 'params demo', url: '/api/params' })
  query(id: number, code: string) {
    this.ctx.body = {
      ...this.requestInfo(`${id}`),
      id, code,
    };
  }
};
```

### Service
```ts
import { Service, serviceMetadata, Context } from 'egg-typed';

@serviceMetadata()
export default class TestService extends Service {
  get(id: string | number) {
    return {
      id,
      name: this.app.config.test + '_' + id,
    };
  }
}

```

## Using && Configure
1. use egg-init to initialize a project.
2. config project.json add:
```json
  "egg": {
    "framework": "egg-typed"
  },
```
3. An example of tsconfig.json:
```json
{
  "compilerOptions": {
    "target": "es6",
    "module": "commonjs",
    "moduleResolution": "node",
    "noImplicitAny": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "preserveConstEnums": true,
    "declaration": true,
    "sourceMap": true,
    "rootDir": "src",
    "outDir": "app",
    "pretty": true
  }
}
```

## QuickStart

```bash
$ npm install
$ npm test
```

publish your framework to npm, then change app's dependencies:

```js
// {app_root}/index.js
require('egg-typed').startCluster({
  baseDir: __dirname,
  // port: 7001, // default to 7001
});

```

## Questions & Suggestions

Please open an issue [here](https://github.com/zhang740/egg-typed/issues).

