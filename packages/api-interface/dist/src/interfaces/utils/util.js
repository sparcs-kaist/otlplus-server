'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.generationUnionTypeChecker = generationUnionTypeChecker;
function generationUnionTypeChecker(...values) {
  return function (value) {
    if (typeof value !== 'string') return new Error('Invalid value: ' + value);
    return values.includes(value) ? value : new Error('Invalid value: ' + value);
  };
}
//# sourceMappingURL=util.js.map
