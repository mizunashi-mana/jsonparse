# Parser APIs

## List of full parsers

### Included parsers / parser generators:

| Name | API | Description |
| --- | --- | --- |
| [base parser](../examples/parsers/base.js) | `sonparser.base` | This parser through target object always as it is.  You can use as method chains root. |
| [succeed parser](../examples/parsers/succeed.js) | `sonparser.succeed` | This parser returns the success with given value. |
| [fail parser](../examples/parsers/fail.js) | `sonparser.fail` | This parser returns the failure with given failure info. |
| [boolean parser](../examples/parsers/boolean.js) | `sonparser.boolean` | This parser checks that the type of target object is `boolean`. |
| [number parser](../examples/parsers/number.js) | `sonparser.number` | This parser checks that the type of target object is `number`. |
| [string parser](../examples/parsers/string.js) | `sonparser.string` | This parser checks that the type of target object is `string`. |
| [object parser](../examples/parsers/object.js) | `sonparser.object` | This parser checks that the type of target object is `object` (not included `array`). |
| [array parser gen](../examples/parsers/array.js) | `sonparser.array(p)` | This generates a parser that checks the type of target object is `array` and convert each elements as element type using receive parser. |
| [hasProperties parser gen](../examples/parsers/has_properties.js) | `sonparser.hasProperties(arr)` | This parser checks that `object` type target has specify properties and convert each properties using receive parsers. `arr` type is `[string, parser][]`, list of property name and for parser. |
| [tuple1/2/3/4/5 parser gen](../examples/parsers/tuples.js) | `sonparser.tuple1/2/3/4/5(parser1,...)` | This generates a parser that checks the type of target object is `tuple` and convert eash elements as element type using receive parser. |
| [hash parser gen](../examples/parsers/hash.js) | `sonparser.hash(parser)` | This generates a parser that checks the type of target object is `hash` of parser's expected type. |
| [custom parser gen](../examples/parsers/boolean.js) | `sonparser.custom(f)` | You can generate and customize your own parser.  See [How to customize](#custom-parser). |

### Parser methods

| Name | API | Description |
| --- | --- | --- |
| [or parser gen](../examples/parsers/or.js) | `parser.or(otherParser)` | This parser tries `parser`, and if it fails uses `otherParser`. |
| [and parser gen](../examples/parsers/and.js) | `parser.and(otherParser)` | This parser tries `parser`, and parses the result of `parser` using `otherParser`. |
| [map parser gen](../examples/parsers/map.js) | `parser.map(function(result) { return anotherResult; })` | This parser transforms the output of `parser` with the given function. |
| [default parser gen](../examples/parsers/default.js) | `parser.default(result)` | This parser sets a default value on failure and just through on success. |
| [option parser gen](../examples/parsers/option.js) | `parser.option(result)` | This parser sets a option value on fail of `undefined` and just through on success. |
| [desc parser gen](../examples/parsers/desc.js) | `parser.desc(msg, exp)` | This parser resets its description from given value. |
| [descFromExpected parser gen](../examples/parsers/desc_from_expected.js) | `parser.descFromExpected(exp|[exp])` | This parser resets its description from given expected. |
| [then parser gen](../examples/parsers/then.js) | `parser.then(onSuccess, onFailure)` | This parser calls success function on success and failure function on failure.　Success function will receive parsed object, and failure function will receive message and expected. |
| [catch parser gen](../examples/parsers/catch.js) | `parser.catch(onFailure)` | This parser calls failure function on failure.　Failure function will receive message and expected. |

## Custom Parser

You can add your new parsers by using `sonparser.custom`.  See an example.

```javascript
function enum(enumerators) {
  if (enumerators instanceof Array) {
    throw TypeError("enumerators must be array.");
  }

  /**
   * `success` is make success function.
   * `failure` is make failure function.
   */
  return sonparser.custom(function (success, failure) {
    // custom parser needs parse function
    return function(obj) {
      if (enumerators.indexOf(obj) != -1) {
        return success(obj);
      }
      return failure("Target object must be my enum", '"ERROR" | "INFO" | "DEBUG"');
    };
  });
}

enum(["ERROR", "INFO", "DEBUG"]).parse("ERROR"); // success
enum(["ERROR", "INFO", "DEBUG"]).parse("WARN"); // failure
```

There are [other examples](../examples/parsers/custom.js).

 * `success` : `function(obj) { return result.success(obj); }`
 * `failure` : `function(message, expected, actual) { return result.failure(message, expected, actual); }`
