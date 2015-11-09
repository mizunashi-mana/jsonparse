# Reporter APIs

## List of full reporters

### Included reporters:

Now, there is nothing.  However, I will include some usual reporters as soon as.

### Included reporter generators:

| Name | API | Description |
| --- | --- | --- |
| [nest reporter](../examples/reporters/nest.js) | `reporters.nestReporter(logf, depth)` | This reporter reports parse errors with nest shown. |
| [list reporter](../examples/reporters/list.js) | `reporters.listReporter(logf, depth)` | This reporter reports parse errors with list shown. |
| [json reporter](../examples/reporters/json.js) | `reporters.jsonReporter(logf, depth)` | This reporter reports parse errors with json shown. |
| [json reporter](../examples/reporters/json.js) | `reporters.jsonReporter(logf, flags, depth)` | This reporter reports parse errors with json shown by flags. |
| [custom reporter](../examples/reporters/custom.js) | `reporters.customReporter(customF, emitter)` | This reporter reports parse errors with your own report function.  See [How to customize](#custom-reporter) |

## json Reporter flags

 * `isOneLine` : Is JSON string one linear. (default: `false`)

## Custom Reporter

You can add your new reporters by using `reporters.customReporter`.  See an example.

```javascript
function detailReporter(depth) {
  if (typeof depth !== "number" && typeof depth !== "undefined") {
    throw TypeError("depth must be number.");
  }

  return sonparser.Reporters.customReporter(function (reportInfo, data) {
    if (data.depth > depth) {
      return;
    }

    if (data.depth === depth || data.isLeaf) {
      console.log("Error:[" + data.propertyName + "]: " + reportInfo.message);
      if (
        typeof reportInfo.expected !== "undefined"
        && typeof reportInfo.actual !== "undefined"
      ) {
        console.log("Expected " + reportInfo.expected + ", but got " + reportInfo.actual);
      }
    }
  });
}

/**
 * Output:
 * ```
 * Error:[this]: "not expected!" is not 'boolean'
 *   - Expected boolean, but got "not expected!"
 * ```
 */
sonparser.boolean.parseWithReporter("not expected!", detailReporter());

/**
 * Output:
 * ```
 * Error:[this.prop1]: "not boolean!" is not 'boolean'
 *   - Expected boolean, but got "not boolean!"
 * Error:[this.prop2.prop21]: undefined is not 'string'
 *   - Expected string, but got undefined
 * Error:[this.prop3[0]]: "not number" is not 'number'
 *   - Expected number, but got "not number"
 * Error:[this.prop3[2]]: true is not 'number'
 *   - Expected number, but got true
 * ```
 */
sonparser.hasProperties([
  ["prop1", sonparser.boolean],
  ["prop2", sonparser.hasProperties([
    ["prop21", sonparser.string],
  ])],
  ["prop3", sonparser.array(sonparser.number)],
]).parseWithReporter({
  "prop1": "not boolean!",
  "prop2": {
    "anything": "not prop21"
  },
  "prop3": [
    "not number",
    1,
    true,
  ],
}, detailReporter());
```

There are [other examples](../examples/parsers/custom.js).

 * `customF` : `function({message, expected, actual}, {depth, propertyName, isLeaf}){ return; }`
 * `emitter` : `EventEmitter` object
   * `emitter.on("begin", function(message, expected, actual) { return; })`
   * `emitter.on("end", function(message, expected, actual) { return; })`
