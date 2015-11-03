# Parse APIs

## List of full methods

### Included object parse methods

For more information, see [main examples][main example].

| API | Description |
| --- | --- |
| `parser.parse(obj)` | The standard parse method.  This returns converted value on success, and throws parse error on failure. |
| `parser.parseWithStatus(obj)` | The safe parse method.  This returns converted result with status.  If failure, returns status `false` without result value, and if success, returns status `true` with result value. |
| `parser.parseWithReporter(obj, reporter?)` | The report and parse method.  This returns converted result on success, and throws parse error and report by using reporter on failure.  Default reporter is `nestReporter`. |
| `parser.parseAsync(obj)` | Parsing on ES6 Promise method.  This returns a promise converted result on success, and reject with error on failure. |

### Included for file APIs

For more information, see [file examples][file example].

| API | Description |
| --- | --- |
| `parseFile(filename, objParser)` | The standard parse file function.  This returns converted value on success, and throws parse error on failure. |
| `parseFileWithStatus(filename, objParser)` | The safe parse file function.  This returns converted result with status.  If failure, returns status `false` without result value, and if success, returns status `true` with result value. |
| `parseFileAsync(filename, objParser)` | Parsing file on ES6 Promise function.  This returns a promise converted result on success, and reject with error on failure. |

[main example]: ../examples/main.js
[file example]: ../examples/file.js
