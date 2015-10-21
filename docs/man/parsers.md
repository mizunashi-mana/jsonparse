# List of parsers

There are many parsers you can use.

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
