'use strict';

module.exports.clone = function clone(obj, deepcopy) {
  var i, attr, copy, dcopyf, len;

  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  dcopyf = !!deepcopy;
  copy = obj.constructor();

  // Handle Array
  if (obj instanceof Array) {
    copy = [];
    for (i = 0, len = obj.length; i < len; i++) {
      copy[i] = dcopyf ? clone(obj[i], dcopyf) : obj[i];
    }
    return copy;
  }

  for (attr in obj) {
    if (obj.hasOwnProperty(attr)) {
      copy[attr] = dcopyf ? clone(obj[attr]) : obj[attr];
    }
  }
  return copy;
};

module.exports.objClone = function objClone(obj) {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (e) {
    return obj;
  }
};

module.exports.inherits = function inherits(ctor, superCtor) {

  if (typeof ctor === 'undefined' || ctor === null) {
    throw new TypeError('The constructor to `inherits` must not be ' +
                        'null or undefined.');
  }

  if (typeof superCtor === 'undefined' || superCtor === null) {
    throw new TypeError('The super constructor to `inherits` must not ' +
                        'be null or undefined.');
  }

  if (typeof superCtor.prototype === 'undefined') {
    throw new TypeError('The super constructor to `inherits` must ' +
                        'have a prototype.');
  }

  /* eslint-disable no-underscore-dangle */
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
