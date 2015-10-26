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

## json Reporter flags

 * `isOneLine` : Is JSON string one linear. (default: `false`)
