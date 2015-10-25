# node-sonparser

Safe parser of JSON and CSON for config parsing like ConfigParser of python.

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

For more information, view the [documentation](docs/man/README.md).

## Status

Current status of code: Developing

So, there are not documents, and not useful.
I think you should not use this package for your project because I will include big changes recently.

However, users and reporters are always welcome. And, also developers.

## Installation

```
npm install sonparser --save
```

## Quick Example

```javascript
var sonparser = require("sonparser");

var ExampleTsConfParser = sonparser.hasProperties([
  ["compilerOptions", sonparser.hasProperties([
    ["target", sonparser.string],
    ["module", sonparser.string],
    ["noImplicitAny", sonparser.boolean.option(false)],
    ["preserveConstEnums", sonparser.boolean.option(false)],
  ])],
  ["exclude", sonparser.array(sonparser.string).option([])],
]);

ExampleTsConfParser.parse({
  "compilerOptions": {
    "target": "es5",
    "module": "commonjs"
  },
  "exclude": [
    "node_modules",
    "build"
  ]
});

ExampleTsConfParser.parse({
  "compilerOptions": {
    "target": 5,
    "module": "commonjs"
  }
}); // throw Error!
```

## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/sonparser.svg?style=flat-square
[npm-url]: https://npmjs.org/package/sonparser
[travis-image]: https://travis-ci.org/mizunashi-mana/node-sonparser.svg?branch=master
[travis-url]: https://travis-ci.org/mizunashi-mana/node-sonparser
[license-image]: http://img.shields.io/npm/l/sonparser.svg?style=flat-square
[license-url]: LICENSE
[downloads-image]: http://img.shields.io/npm/dm/sonparser.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/sonparser
