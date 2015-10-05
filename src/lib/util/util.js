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
