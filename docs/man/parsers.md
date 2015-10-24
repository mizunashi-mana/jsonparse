# Parser APIs

## List of full parsers

### Included parsers / parser generators:

| Name | API | Description |
| --- | --- | --- |
| [base parser](docs/examples/parsers/base.js) | `sonparser.base` | This parser through target object always as it is.  You can use as method chains root. |
| [boolean parser](docs/examples/parsers/boolean.js) | `sonparser.boolean` | This parser checks that the type of target object is `boolean`. |
| [number parser](docs/examples/parsers/number.js) | `sonparser.number` | This parser checks that the type of target object is `number`. |
| [string parser](docs/examples/parsers/string.js) | `sonparser.string` | This parser checks that the type of target object is `string`. |
| [object parser](docs/examples/parsers/object.js) | `sonparser.object` | This parser checks that the type of target object is `object` (not included `array`). |
| [array parser gen](docs/examples/parsers/array.js) | `sonparser.array(p)` | This generates a parser that checks the type of target object is `array` and convert each elements as element type using receive parser. |
| [hasProperties parser gen](docs/examples/parsers/has_properties.js) | `sonparser.hasProperties(arr)` | This parser checks that `object` type target has specify properties and convert each properties using receive parsers. `arr` type is `[string, parser][]`, list of property name and for parser. |
| [custom parser gen](docs/examples/parsers/boolean.js) | `sonparser.custom(f)` | You can generate and customize your own parser.  See [How to customize](#Custom Parser). |

### Parser methods

| Name | API | Description |
| --- | --- | --- |
| [or parser gen](docs/examples/parsers/or.js) | `parser.or(otherParser)` | This parser tries `parser`, and if it fails uses `otherParser`. |
| [and parser gen](docs/examples/parsers/and.js) | `parser.and(otherParser)` | This parser tries `parser`, and parses the result of `parser` using `otherParser`. |
| [map parser gen](docs/examples/parsers/map.js) | `parser.map(function(result) { return anotherResult; })` | This parser transforms the output of `parser` with the given function. |
| [default parser gen](docs/examples/parsers/default.js) | `parser.default(result)` | This parser sets default value on failure and just through on success. |


## Custom Parser
