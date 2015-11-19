# node-sonparser

Safe parser of JSON and CSON for config parsing like ConfigParser of python.

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

For more information, view the [documentation][main-document].

## Installation

```
npm install sonparser --save
```

## Quick Example

### Javascript

```javascript
var sonparser = require("sonparser");

var result;

var ExampleTsConfParser = sonparser.hasProperties([
  ["compilerOptions", sonparser.hasProperties([
    ["target", sonparser.string],
    ["module", sonparser.string],
    ["noImplicitAny", sonparser.boolean.option(false)],
    ["preserveConstEnums", sonparser.boolean.option(false)],
  ])],
  ["exclude", sonparser.array(sonparser.string).option([])],
]);

result = ExampleTsConfParser.parse({
  "compilerOptions": {
    "target": "es5",
    "module": "commonjs"
  },
  "exclude": [
    "node_modules",
    "build"
  ]
});

result = ExampleTsConfParser.parse({
  "compilerOptions": {
    "target": 5,
    "module": "commonjs"
  }
}); // throw Error!
```

### Typescript

```typescript
/// <reference path="node_modules/sonparser/lib-typings/sonparser.d.ts" />

import * as sonparser from "sonparser";

let result: TsConfig;

interface CompilerOptions {
  target: string;
  module: string;
  noImplicitAny: boolean;
  preserveConstEnums: boolean;
}

interface TsConfig {
  compilerOptions: CompilerOptions;
  exclude: string[];
}

const ExampleTsConfParser = sonparser.hasProperties<TsConfig>([
  ["compilerOptions", sonparser.hasProperties<CompilerOptions>([
    ["target", sonparser.string],
    ["module", sonparser.string],
    ["noImplicitAny", sonparser.boolean.option(false)],
    ["preserveConstEnums", sonparser.boolean.option(false)],
  ])],
  ["exclude", sonparser.array(sonparser.string).option([])],
]);

result = ExampleTsConfParser.parse({
  compilerOptions: {
    target: "es5",
    module: "commonjs"
  },
  exclude: [
    "node_modules",
    "build"
  ]
});

result = ExampleTsConfParser.parse({
  compilerOptions: {
    target: 5,
    module: "commonjs"
  }
}); // throw Error!
```

## License

[MIT](LICENSE)

<!--
## Fantasyland

[![Fantasyland][fantasy-land-logo]][fantasy-land-url]
-->

[npm-image]: https://img.shields.io/npm/v/sonparser.svg?style=flat-square
[npm-url]: https://npmjs.org/package/sonparser
[travis-image]: https://travis-ci.org/mizunashi-mana/node-sonparser.svg?branch=master
[travis-url]: https://travis-ci.org/mizunashi-mana/node-sonparser
[license-image]: http://img.shields.io/npm/l/sonparser.svg?style=flat-square
[license-url]: LICENSE
[downloads-image]: http://img.shields.io/npm/dm/sonparser.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/sonparser
[main-document]: docs/man/README.md
[fantasy-land-logo]: https://github.com/fantasyland/fantasy-land/raw/master/logo.png
[fantasy-land-url]: https://github.com/fantasyland/fantasy-land
