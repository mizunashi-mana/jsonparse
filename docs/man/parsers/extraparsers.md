# List of extra parsers

There are some extra parsers you can use.

## custom parser

This parser can customize with parse function.

```javascript
var sparse = require("sonparser");
var assert = require("assert");
var a;

var MyEnumParseFunc = function(makeSuccess, makeFailure) {
  return function(obj) {
    if (["VAL1", "VAL2", "VAL3"].indexOf(obj) != -1) {
      return makeSuccess(obj);
    }
    return makeFailure('expected "VAL1", "VAL2" or "VAL3"', '"VAL1" | "VAL2" | "VAL3"');
  };
};
var MyEnumParser = sparse.custom(MyEnumParseFunc);

a = MyEnumParser.parse("VAL1"); // success
assert.strictEqual(a, "VAL1");

a = MyEnumParser.parse("VAL3"); // success
assert.strictEqual(a, "VAL3");

a = MyEnumParser.parse(0); // throw Error
a = MyEnumParser.parse("str"); // throw Error

var MyConvertParseFunc = function(makeSuccess, makeFailure) {
  return function(obj) {
    if (typeof obj === "boolean") {
      return makeSuccess(obj);
    } else if (typeof obj === "number") {
      return makeSuccess(obj == 0);
    } else if (typeof obj === "string") {
      switch(obj) {
        case "true":
        case "yes":
        case "on":
          return makeSuccess(true);
        case "false":
        case "no":
        case "off":
          return makeSuccess(false);
      }
      return makeFailure("${JSON.stringify(obj)} is not flag string", "flag string(yes/no)");
    } else {
      return makeFailure("this is not bool object", "bool object");
    }
  };
};
var MyConvertParser = sparse.custom(MyConvertParseFunc);

a = MyConvertParser.parse(true); // success
assert.strictEqual(a, true);

a = MyConvertParser.parse(0); // success
assert.strictEqual(a, false);

a = MyConvertParser.parse("true"); // success
assert.strictEqual(a, true);

a = MyConvertParser.parse("no"); // success
assert.strictEqual(a, false);

a = MyConvertParser.parse("str"); // throw Error
a = MyConvertParser.parse({}); // throw Error
a = MyConvertParser.parse([]); // throw Error
```

## hasProperties parser

This parser checks that `object` type target has specify properties and convert each properties using receive parsers.

```javascript
var sparse = require("sonparser");
var assert = require("assert");
var a;

var MyEnumParseFunc = function(makeSuccess, makeFailure) {
  return function(obj) {
    if (["VAL1", "VAL2", "VAL3"].indexOf(obj) != -1) {
      return makeSuccess(obj);
    }
    return makeFailure('expected "VAL1", "VAL2" or "VAL3"', '"VAL1" | "VAL2" | "VAL3"');
  };
};
var MyEnumParser = sparse.custom(MyEnumParseFunc);
var MyObjectParser = sparse.hasProperties([
  ["propBool", sparse.boolean],
  ["propNum", sparse.number],
  ["propStr", sparse.string],
  ["propObj", sparse.hasProperties([
    ["propNumArr", sparse.array(sparse.number)],
    ["propEnum", MyEnumParser],
  ])],
]);

a = MyObjectParser.parse({
  "propBool": true,
  "propNum": 1,
  "propStr": "str",
  "propObj": {
    "propNumArr": [0,1,2],
    "propEnum": "VAL2",
  },
}); // success
assert.deepEqual(a, {
  "propBool": true,
  "propNum": 1,
  "propStr": "str",
  "propObj": {
    "propNumArr": [0,1,2],
    "propEnum": "VAL2",
  },
});

a = MyObjectParser.parse({
  "propBool": true,
  "propNum": 1,
  "propStr": "str",
  "propObj": {
    "propNumArr": [0,1,2],
    "propEnum": "VAL2",
    "propExtra1": "extra str",
  },
  "propExtra2": {},
}); // success
assert.deepEqual(a, {
  "propBool": true,
  "propNum": 1,
  "propStr": "str",
  "propObj": {
    "propNumArr": [0,1,2],
    "propEnum": "VAL2",
  },
});

a = MyObjectParser.parse({}); // throw Error
a = MyObjectParser.parse({
  "propBool": true,
  "propStr": "str",
}); // throw Error
a = MyObjectParser.parse({
  "propBool": true,
  "propNum": 1,
  "propStr": true,
  "propObj": {
    "propNumArr": [0,1,2],
    "propEnum": "VAL2",
  },
}); // throw Error
a = MyObjectParser.parse(true); // throw Error
```
