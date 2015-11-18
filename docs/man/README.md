# node-sonparser

This is a parser library for JSON Object.

## Features

 * Parse JSON object safety and flexibly
 * Support to parse JSON object
 * Provide primitive parsers for JSON object
 * Provide primitive reporters for parsing error
 * Support for JSON and CSON file

## Contents

### Explanation

This library provides JSON parsers and parser combinators.

You can check JSON configs and convert JSON objects easily by using this library.

For more information, see and find [examples][examples].

### Tips and patterns

You can see really patterns on [main examples][main example], and file patterns on [file examples][file example].

 1. Choose or create by chaining or customize parsers (you can find parsers on [here][parsers document])

  ```javascript
  const chosenParser = sonparser.boolean;
  const chainParser = sonparser
    .boolean
    .or(sonparser.number.map((num) => num !== 0))
    .option(true);
  ```

 2. Optionally, choose a reporter (you can find reporters on [here][reporters document])

  ```javascript
  const nestReporter = sonparser.Reporters.nestReporter;
  ```

 3. Give the target JSON object to a parser (you can see more parse flow information on [here][methods document])

  ```javascript
  return chainParser.parse(true);

  // with the result for report and safety
  return chainParser.parseWithResult("not expected!")
    .report(nestReporter)
    .except("Failed to parse!");
  ```

 4. Accept parsed result (try-catch error or choose safe method and check)

## Links

 * [methods document][methods document]
 * [parsers document][parsers document]
 * [reporters document][reporters document]
 * [main example][main example]
 * [Parsimmon][parsimmon-url]
   * `node-sonparser` referred this library that parser combinator js library.
 * [TsMonad][tsmonad-url]
   * `node-sonparser` referred this library that simple monad ts library
 * [Fantasy Land][fantasy-land-url]

[examples]: ../examples
[main example]: ../examples/main.js
[file example]: ../examples/file.js
[methods document]: ./methods.md
[parsers document]: ./parsers.md
[reporters document]: ./reporters.md
[parsimmon-url]: https://www.npmjs.com/package/parsimmon
[tsmonad-url]: https://www.npmjs.com/package/tsmonad
[fantasy-land-logo]: https://github.com/fantasyland/fantasy-land/raw/master/logo.png
[fantasy-land-url]: https://github.com/fantasyland/fantasy-land
