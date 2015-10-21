# List of type parsers

There are many type parsers you can use.

## base parser

This parser is as chain root.

All objects pass through.

```javascript
var sparse = require("sonparser");
var a;

// all objects pass through as they are
a = sparse.base.parse(true);
a = sparse.base.parse(0);
a = sparse.base.parse("");
a = sparse.base.parse({});
```

## boolean parser

This parser is judge that the type of target object is `boolean`.

```javascript
var sparse = require("sonparser");
var assert = require("assert");
var a;

a = sparse.boolean.parse(false); // success
assert.strictEqual(a, false);

a = sparse.boolean.parse(true); // success
assert.strictEqual(a, true);

a = sparse.boolean.parse(0); // throw Error
a = sparse.boolean.parse("true"); // throw Error
```

## number parser

This parser is judge that the type of target object is `number`.

```javascript
var sparse = require("sonparser");
var assert = require("assert");
var a;

a = sparse.number.parse(0); // success
assert.strictEqual(a, 0);

a = sparse.number.parse(2.718); // success
assert.strictEqual(a, 2.718);

a = sparse.number.parse(false); // throw Error
a = sparse.number.parse("10"); // throw Error
```

## string parser

This parser is judge that the type of target object is `string`.

```javascript
var sparse = require("sonparser");
var assert = require("assert");
var a;

a = sparse.string.parse(""); // success
assert.strictEqual(a, "");

a = sparse.string.parse("str"); // success
assert.strictEqual(a, "str");

a = sparse.string.parse("0"); // success
assert.strictEqual(a, "0");

a = sparse.string.parse(false); // throw Error
a = sparse.string.parse(10); // throw Error
```

## object parser

This parser is judge that the type of target object is `object`.

In this library, `array` is not included `object`. So, this parser will throw Error.  

```javascript
var sparse = require("sonparser");
var assert = require("assert");
var a;

a = sparse.object.parse({}); // success
assert.deepEqual(a, {});

a = sparse.object.parse({"a": "a"}); // success
assert.deepEqual(a, {"a": "a"});

a = sparse.object.parse({"0": "a", "length": "1"}); // success
assert.deepEqual(a, {"0": "a", "length": "1"});

a = sparse.object.parse(false); // throw Error
a = sparse.object.parse(10); // throw Error
a = sparse.object.parse("str"); // throw Error
a = sparse.object.parse([0,1]); // throw Error
```

## array parser

This parser is judge the type of target object is `array` and convert each elements as element type using receive parser for elements.

```javascript
var sparse = require("sonparser");
var assert = require("assert");
var a;

var strArray = sparse.array(sparse.string);

a = strArray.parse([]); // success
assert.deepEqual(a, []);

a = strArray.parse(["0", "true", "str"]); // success
assert.deepEqual(a, ["0", "true", "str"]);

a = strArray.parse([0, true, "str"]); // throw Error
a = strArray.parse({}); // throw Error

var checkArray = sparse.array(sparse.base);

a = checkArray.parse([true, 0, "str", {}, []]); // success
assert.deepEqual(a, [true, 0, "str", {}, []]);

a = checkArray.parse({}) // throw Error
a = checkArray.parse(true) // throw Error

var str2DimArray = sparse.array(strArray);

a = str2DimArray.parse([]); // success
assert.deepEqual(a, []);

a = str2DimArray.parse([[]]); // success
assert.deepEqual(a, [[]]);

a = str2DimArray.parse([["str"], ["a", "b"]]); //success
assert.deepEqual(a, [["str"], ["a", "b"], []]);

a = str2DimArray.parse({}); // throw Error
a = str2DimArray.parse([{}, ["str"]]); // throw Error
a = str2DimArray.parse([[{}], ["str"]]); // throw Error
```
