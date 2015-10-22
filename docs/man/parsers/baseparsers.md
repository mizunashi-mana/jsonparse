# List of base parsers

There are some base parsers you can use.

## or parser

This parser tries first parser, and if it fails uses second parser.

```javascript
var sparse = require("sonparser");
var assert = require("assert");
var a;

var boolStrParser = sparse.custom(function(makeSuccess, makeFailure) {
  return function(obj) {
    if(["true", "yes", "on"].indexOf(obj) != -1) {
      return makeSuccess(true);
    } else if(["false", "no", "off"].indexOf(obj) != -1) {
      return makeSuccess(false);
    }
    return makeFailure(JSON.stringify(obj) + " is not bool string", "bool string(yes/no)");
  };
});

a = sparse.boolean.or(boolStrParser).parse(true); // success
assert.strictEqual(a, true);

a = sparse.boolean.or(boolStrParser).parse("no"); // success
assert.strictEqual(a, false);

a = sparse.boolean.or(boolStrParser).parse("on"); // success
assert.strictEqual(
  a, boolStrParser.or(sparse.boolean).parse(true)
);

a = sparse.boolean.or(boolStrParser).parse(0); // throw Error
a = sparse.boolean.or(boolStrParser).parse("str"); // throw Error
a = sparse.boolean.or(boolStrParser).parse([]); // throw Error
```

## and parser

This parser tries first parser, and the result of first parser parses using second parser.

```javascript
var sparse = require("sonparser");
var assert = require("assert");
var a;

var IsEvenNatualParser = sparse.custom(function(makeSuccess, makeFailure) {
  return function(obj) {
    if (Number.isInteger(obj) && obj >= 0) {
      return makeSuccess(obj % 2 == 0);
    } else {
      return makeFailure(obj + " is not natural number", "natural number");
    }
  };
});
var IsEvenNaturalNumberParser = sparse.number.and(IsEvenNatualParser);

a = IsEvenNaturalNumberParser.parse(0); // success
assert.strictEqual(a, true);

a = IsEvenNaturalNumberParser.parse(11); // success
assert.strictEqual(a, false);

a = IsEvenNaturalNumberParser.parse(-101); // throw Error
a = IsEvenNaturalNumberParser.parse(2.7); // throw Error
a = IsEvenNaturalNumberParser.parse("str"); // throw Error
```

## map parser

This parser transforms the output of parser with the given function.

```javascript
var sparse = require("sonparser");
var assert = require("assert");
var a;

var IsIntegerParser = sparse.number.map(Number.isInteger);

a = IsIntegerParser.parse(-1); // success
assert.strictEqual(a, true);

a = IsIntegerParser.parse(11.11); // success
assert.strictEqual(a, false);

a = IsIntegerParser.parse("str"); // throw Error
```
