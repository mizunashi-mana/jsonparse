var assert = require("chai").assert;

var jsonparse = require("../../build/");
var ConfigParseError = jsonparse.ConfigParseError;

describe("base parsers test", function() {

  describe("basetype parsers test", function() {

    it("should be through only boolean value by boolean parser", function() {
      assert.strictEqual(jsonparse.boolean.parse(true), true);
      assert.throw(function() {
        return jsonparse.boolean.parse(1);
      }, ConfigParseError);
    });

    it("should be through only number value by number parser", function() {
      assert.strictEqual(jsonparse.number.parse(1), 1);
      assert.throw(function() {
        return jsonparse.number.parse("1");
      }, ConfigParseError);
    });

    it("should be through only string value by string parser", function() {
      assert.strictEqual(jsonparse.string.parse("str"), "str");
      assert.throw(function() {
        return jsonparse.string.parse(true);
      }, ConfigParseError);
    });

    it("should be through only object value by object parser", function() {
      assert.deepEqual(jsonparse.object.parse({}), {});
      assert.deepEqual(jsonparse.object.parse({
        a: "a",
        b: "b"
      }), {
        a: "a",
        b: "b"
      });
      assert.throw(function() {
        return jsonparse.object.parse([]);
      }, ConfigParseError);
      assert.throw(function() {
        return jsonparse.object.parse("");
      }, ConfigParseError);
    });

    it("should be through only strict array value by array parser", function() {
      var StringArrayParser = jsonparse.array(jsonparse.string);

      assert.deepEqual(StringArrayParser.parse([]), []);
      assert.deepEqual(StringArrayParser.parse(["", "true", "1"]), ["", "true", "1"]);
      assert.throw(function() {
        return StringArrayParser.parse(["", true, 1]);
      }, ConfigParseError);
      assert.throw(function() {
        return StringArrayParser.parse({
          "0": "1"
        });
      }, ConfigParseError);
      assert.throw(function() {
        return StringArrayParser.parse({
          0: "1"
        });
      }, ConfigParseError);
    });

  });

  describe("base extra parsers test", function() {

    it("should be through only having specify properties by hasProperties parser", function() {
      var MyObjectParser = jsonparse.hasProperties([
        ["propB", jsonparse.boolean],
        ["propN", jsonparse.number],
        ["propS", jsonparse.string],
        ["propO", jsonparse.object],
        ["propAs", jsonparse.array(jsonparse.string)],
      ]);

      assert.deepEqual(MyObjectParser.parse({
        "propB": true,
        "propN": 1,
        "propS": "str",
        "propO": {
          "anything": true
        },
        "propAs": ["str1", "str2"],
      }), {
        "propB": true,
        "propN": 1,
        "propS": "str",
        "propO": {
          "anything": true
        },
        "propAs": ["str1", "str2"],
      });
      assert.deepEqual(MyObjectParser.parse({
        "propB": true,
        "propN": 1,
        "propS": "str",
        "propO": {
          "anything": true
        },
        "propAs": ["str1", "str2"],
        "propExtra": "anything!"
      }), {
        "propB": true,
        "propN": 1,
        "propS": "str",
        "propO": {
          "anything": true
        },
        "propAs": ["str1", "str2"],
      });
      assert.throw(function() {
        return MyObjectParser.parse({
          "propB": true,
          "propN": 1,
          "propS": "str",
          "propO": {
            "anything": true
          },
        });
      }, ConfigParseError);
      assert.throw(function() {
        return MyObjectParser.parse({
          "propB": true,
          "propN": true,
          "propS": "str",
          "propO": {
            "anything": true
          },
          "propAs": ["str1", "str2"],
        });
      }, ConfigParseError);
      assert.throw(function() {
        return MyObjectParser.parse({
          "propB": true,
          "propN": true,
          "propS": "str",
          "propOther": {
            "anything": true
          },
          "propAs": ["str1", "str2"],
        });
      }, ConfigParseError);
    });

    it("should be customize by my custom parser", function() {
      var CustomParser1 = jsonparse.custom(function(makeSuccess, makeFailure) {
        return function(obj) {
          if (typeof obj === "number") {
            return makeSuccess(true);
          } else if (typeof obj === "string") {
            return makeSuccess(false);
          }
          return makeFailure();
        };
      });
      var CustomParser2 = jsonparse.custom(function(makeSuccess, makeFailure) {
        return function(obj) {
          if (obj === "debug" || obj === "info" || obj === "error") {
            return makeSuccess(obj);
          }
          return makeFailure();
        };
      });

      assert.strictEqual(CustomParser1.parse(1), true);
      assert.strictEqual(CustomParser1.parse("str"), false);
      assert.throw(function() { return CustomParser1.parse(true); }, ConfigParseError);
      assert.strictEqual(CustomParser2.parse("debug"), "debug");
      assert.strictEqual(CustomParser2.parse("info"), "info");
      assert.strictEqual(CustomParser2.parse("error"), "error");
      assert.throw(function() { return CustomParser2.parse("not implement"); }, ConfigParseError);
    });
  });
});
