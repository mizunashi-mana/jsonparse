const sparse = require("sonparser");
const assert = require("assert");

const nestConsoleReporter = sparse.Reporters.nestReporter(console.log);

/**
 * check boolean
 */
const booleanParser = sparse.boolean;

const resultCheckBoolean = booleanParser.parse(true);
assert.strictEqual(
  resultCheckBoolean,
  true
);

assert.throws(
  () => booleanParser.parse("not boolean!"),
  sparse.ConfigParseError
);

// if you don't want to use try-catch
const resultCheckBooleanSafetySuccess = booleanParser.parseWithStatus(false);
assert.strictEqual(
  resultCheckBooleanSafetySuccess.status,
  true
);
assert.strictEqual(
  resultCheckBooleanSafetySuccess.value,
  false
);

const resultCheckBooleanSafetyFailure = booleanParser.parseWithStatus("not boolean!");
assert.strictEqual(
  resultCheckBooleanSafetyFailure.status,
  false
);

// you can see more human readable message by using reporters
/**
 * Output:
 * this : "not boolean!" is not 'boolean'
 */
try {
  booleanParser.parseWithReporter("not boolean!", nestConsoleReporter);
} catch (e) {
  // catch Error
}

/**
 * check and convert my object
 */
const myObjectParser = sparse.hasProperties([
  ["private", sparse.boolean.option(false)],
  ["name", sparse.string],
  ["version", sparse.string],
  ["description", sparse.string],
  ["keywords", sparse.array(sparse.string).option([])],
  ["scripts", sparse.object],
  ["repository", sparse.hasProperties([
    ["type", sparse.string],
    ["url", sparse.string],
  ]).option({
    "type": "git",
    "url": "",
  })],
]);

const resultCheckMyObject = myObjectParser.parse({
  "name": "example-sonparser",
  "version": "0.0.0",
  "description": "An example of sonparser",
  "keywords": [
    "example",
    "more", "complexible",
  ],
  "scripts": {
    "test": "echo \"not implements!\" && exit 1",
  },
});
assert.deepEqual(
  resultCheckMyObject,
  {
    "private": false,
    "name": "example-sonparser",
    "version": "0.0.0",
    "description": "An example of sonparser",
    "keywords": [
      "example",
      "more", "complexible",
    ],
    "scripts": {
      "test": "echo \"not implements!\" && exit 1",
    },
    "repository": {
      "type": "git",
      "url": "",
    },
  }
);

assert.throws(
  () => myObjectParser.parse("not my object!"),
  sparse.ConfigParseError
);

// you can see more human readable message by using reporters
/**
 * Output:
 * this : failed to parse elem of 'object'
 * ├── .private : "not boolean!" is not 'boolean'
 * ├── .version : 0 is not 'string'
 * ├─┬ .keywords : failed to parse elem of 'array'
 * │ └── [1] : true is not 'string'
 * ├── .scripts : undefined is not 'object'
 * └─┬ .repository : failed to parse elem of 'object'
 *   └── .type : 0 is not 'string'
 */
try {
  myObjectParser.parseWithReporter({
    "private": "not boolean!",
    "name": "example-sonparser",
    "version": 0,
    "description": "An example of sonparser",
    "keywords": [
      "example",
      true,
    ],
    "repository": {
      "type": 0,
      "url": "",
    },
  }, nestConsoleReporter);
} catch (e) {
  // catch Error
}
