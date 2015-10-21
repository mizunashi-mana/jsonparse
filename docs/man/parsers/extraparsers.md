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
    if (obj in ["VAL1", "VAL2", "VAL3"]) {
      return makeSuccess(obj);
    }
    return makeFailure('expected "VAL1", "VAL2" or "VAL3"', '"VAL1" | "VAL2" | "VAL3"');
  };
};
var MyEnumParser = sparse.custom(MyEnumParseFunc);
```


