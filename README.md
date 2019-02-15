# egg-typed

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]

[npm-image]: https://img.shields.io/npm/v/egg-typed.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-typed
[travis-image]: https://img.shields.io/travis/zhang740/egg-typed.svg?style=flat-square
[travis-url]: https://travis-ci.org/zhang740/egg-typed
[codecov-image]: https://codecov.io/github/zhang740/egg-typed/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/zhang740/egg-typed?branch=master
[david-image]: https://img.shields.io/david/zhang740/egg-typed.svg?style=flat-square
[david-url]: https://david-dm.org/zhang740/egg-typed
[snyk-image]: https://snyk.io/test/npm/egg-typed/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-typed

An onther style (like C#/java) of [egg](https://github.com/eggjs/egg) enterprise app framework.

## Quick overview

### 路由

egg-controller

```ts
export class HomeController extends Controller {
  // 如果不需要访问ctx，则不需要继承
  @route("/api/xxx", { name: "获取XXX数据" })
  async getXXX(size: number, page: number) {
    return "homeIndex";
  }
}
```

### 依赖注入

egg-aop

```ts
export class TestService extends Service {
  get(id: string | number) {
    return {
      id,
      name: this.app.config.test + "_" + id
    };
  }
}

export class HomeController extends Controller {
  @lazyInject()
  testService: TestService;

  @route("/api/xxx", { name: "获取XXX数据" })
  async getXXX(id: string) {
    return this.testService.get(id);
  }
}
```

### ORM

### 调用链跟踪

### 场景测试

## 使用 & 配置方法

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

## Questions & Suggestions

Please open an issue [here](https://github.com/zhang740/egg-typed/issues).
