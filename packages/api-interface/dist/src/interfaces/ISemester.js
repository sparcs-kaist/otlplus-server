'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? (desc = Object.getOwnPropertyDescriptor(target, key)) : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i])) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function') return Reflect.metadata(k, v);
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.ISemester = void 0;
const class_validator_1 = require('class-validator');
const validators_decorator_1 = require('@otl/api-interface/src/interfaces/validators.decorator');
var ISemester;
(function (ISemester) {
  class QueryDto {}
  __decorate(
    [
      (0, class_validator_1.IsOptional)(),
      (0, class_validator_1.IsArray)(),
      (0, validators_decorator_1.OrderDefaultValidator)(validators_decorator_1._PROHIBITED_FIELD_PATTERN),
      __metadata('design:type', Array),
    ],
    QueryDto.prototype,
    'order',
    void 0,
  );
  ISemester.QueryDto = QueryDto;
})(ISemester || (exports.ISemester = ISemester = {}));
//# sourceMappingURL=ISemester.js.map
