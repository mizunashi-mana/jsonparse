var BaseCustomError = module.exports.BaseCustomError = function(message) {
  "use strict";

  if (!(this instanceof BaseCustomError)) {
    throw new Error("Call constructor using new");
  }
  Error.call(this);

  this.message = message;
  this.initializeError(this.constructor);
};

require("../util/util").inherits(BaseCustomError, Error);

BaseCustomError.prototype.initializeError = function (extendConstructor) {
  "use strict";

  if (!extendConstructor) {
    // defaults
    this.name = "Error";
  } else {
    this.name = extendConstructor.name;
  }

  Error.captureStackTrace(this, extendConstructor);
};
