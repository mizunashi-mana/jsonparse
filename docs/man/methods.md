# Parse APIs

## List of full methods

### Included object parse methods

For more information, see [main examples][main example].

| API | Description |
| --- | --- |
| `parser.parse(obj)` | The standard parse method.  This returns converted value on success, and throws parse error on failure. |
| `parser.parseAsync(obj)` | Parsing on ES6 Promise method.  This returns a promise converted result on success, and reject with error on failure. |
| `parser.parseWithResult(obj)` | The safe parse method.  This returns converted result with status.  More information, see [How to use result](#usage-of-parserresult). |

### Included for file APIs

For more information, see [file examples][file example].

| API | Description |
| --- | --- |
| `parseFile(filename, objParser)` | The standard parse file function.  This returns converted value on success, and throws parse error on failure. |
| `parseFileAsync(filename, objParser)` | Parsing file on ES6 Promise function.  This returns a promise converted result on success, and reject with error on failure. |
| `parseFileWithResult(filename, objParser)` | The safe parse file function.  This returns converted result with status.  More information, see [How to use result](#usage-of-parserresult). |

## Usage of ParserResult

`parser.parseWithResult` method returns a result object including some helpers, e.g. reporter, judge success and custom except.

### Included result APIs

| API | Description |
| --- | --- |
| `result.isSuccess()` | Return whether this result has success value or not. |
| `result.except(msg?)` | Return success value on success, and throw error on failure. |
| `result.toSuccess(default)` | Return success value on success and default value on failure. |
| `result.toPromise()` | convert this result to a promise object. |
| `result.report(reporter)` | report using given reporter, and return this object. About reporter, see [document][reporters document]. |
| `result.caseOf(onSuccess, onFailure)` | convert results to other using given converters. |

### Tips

#### Report and get

```javascript
var nestCReporter = sonparser.reporters.nestReporter(console.log);
var jsonCReporter = sonparser.reporters.jsonCReporter(console.log);
var result;

result = sonparser.boolean.parseWithResult(true);
result.report(nestCReporter)
  .except("Failed to parse!"); // return success value (`true`)!

result = sonparser.boolean.parseWithResult("not boolean!");
result.report(nestCReporter); // only report
result.report(jsonCReporter); // you can report unlimitedly.

result.report(nestCReporter)
  .except("Failed to parse!"); // throw Error with custom message
result.except("Failed to parse!"); // you can get directly.
```

#### Judge success and safe get

```javascript
var result;

result = sonparser.boolean.parseWithResult(true);
result.toSuccess(true); // you can get success value safety.

// if you want to do anything on failure
if (!result.isSuccess()) {
  // do anything
}

result = sonparser.boolean.parseWithResult("not boolean");
result.toSuccess(true); // return default value (`true`).
result.toSuccess(false); // return default value (`false`).

// you also can use `caseOf` method.
result.caseOf(
  function onSuccess(obj) { return obj; },
  function onFailure(err) {
    // do anything
    return true; // default value
  }
); // return `true` (onFailure's return value)
```

[main example]: ../examples/main.js
[file example]: ../examples/file.js
[reporters document]: ./reporters.md
