# egg-typed

Provide strong support for [egg](https://github.com/eggjs/egg) enterprise app framework.


## Quick overview

you can write Controller/Service like this:
```ts
// [ts source]/controller/home.ts
import { Controller, routerMetadata } from 'egg-typed';
import TestService from '../service/Test';

export default class HomeController extends Controller {

    @routerMetadata({ url: '/' })
    index() {
        this.ctx.body = 'Hello World';
    }

    @routerMetadata({ url: ['/test', '/test2'] })
    test() {
        this.ctx.body = `
            Hello World, Test.
            ${this.service.test.get(123).name}
            ${this.GetService<TestService>(TestService).get('3333').name}
        `;
    }
};

// [ts source]/service/Test.ts
import { Service, Context } from 'egg-typed';

export default class Test extends Service {

    constructor(ctx: Context) {
        super(ctx);
        this.config = this.app.config.test;
    }

    get(id: string) {
        return { id, name: this.config.key + '_' + id };
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
        "emitDecoratorMetadata": false,
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

Please open an issue [here](https://github.com/eggjs/egg/issues).

