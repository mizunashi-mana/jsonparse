var clone = module.exports.clone = function(obj, deepcopy) {
  var i, attr, copy, dcopyf;

  if (obj === null || typeof obj !== "object") return obj;

  dcopyf = !!deepcopy;
  copy = obj.constructor();

  // Handle Array
  if (obj instanceof Array) {
    copy = [];
    for (i = 0, len = obj.length; i < len; i++) {
      copy[i] = dcopyf ? clone(obj[i], dcopyf) : obj[i];
    }
    return copy
  }

  for (attr in obj) {
    if (obj.hasOwnProperty(attr)) copy[attr] = dcopyf ? clone(obj[attr]) : obj[attr];
  }
  return copy;
}

var objClone = module.exports.objClone = function(obj) {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch(e) {
    return obj;
  }
}

var inherits = module.exports.inherits = function(ctor, superCtor) {

  if (ctor === undefined || ctor === null)
    throw new TypeError("The constructor to `inherits` must not be " +
                        "null or undefined.");

  if (superCtor === undefined || superCtor === null)
    throw new TypeError("The super constructor to `inherits` must not " +
                        "be null or undefined.");

  if (superCtor.prototype === undefined)
    throw new TypeError("The super constructor to `inherits` must " +
                        "have a prototype.");

  ctor.super_ = superCtor;
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true,
    }
  });
};


function repeat(count, str) {
  var repU;
  if (count == 0) {
    return "";
  }
  repU = repeat(Math.floor(count / 2), str);
  return repU + repU + ((count % 2) == 1 ? str : "");
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
