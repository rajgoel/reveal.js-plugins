var spec = function () {
  return jasmine.getEnv().currentSpec;
};

var getType = function (value) {
  return Object.prototype.toString.call(value);
};
