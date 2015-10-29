# Parse APIs

## List of full methods

### Included object parse methods

For more information, see [main examples][main example].

| API | Description |
| --- | --- |
| `parser.parse(obj)` | The standard parse method.  This returns converted value on success, and throws parse error on failure. |
| `parser.parseWithStatus(obj)` | The safe parse method.  This returns converted result with status.  If failure, returns status `false` without result value, and if success, returns status `true` with result value. |
| `parser.parseWithReporter(obj, reporter?)` | The report and parse method.  This returns converted result on success, and throws parse error and report by using reporter on failure.  Default reporter is `nestReporter`. |

### Included for file APIs

For more information, see [file examples][file example].

| API | Description |
| --- | --- |
| `parseFile(filename, objParser)` | The standard parse file function.  This returns converted value on success, and throws parse error on failure. |
| `parser.parseFileWithStatus(filename, objParser)` | The safe parse file function.  This returns converted result with status.  If failure, returns status `false` without result value, and if success, returns status `true` with result value. |

[main example]: ../examples/main.js
[file example]: ../examples/file.js
