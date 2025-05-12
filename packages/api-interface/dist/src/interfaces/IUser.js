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
exports.IUser = void 0;
const validators_decorator_1 = require('@otl/api-interface/src/interfaces/validators.decorator');
const class_transformer_1 = require('class-transformer');
const class_validator_1 = require('class-validator');
var IUser;
(function (IUser) {
  class TakenCoursesQueryDto {}
  __decorate(
    [
      (0, class_validator_1.IsOptional)(),
      (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? [value] : value)),
      (0, class_validator_1.IsArray)(),
      (0, class_validator_1.IsString)({ each: true }),
      (0, validators_decorator_1.OrderDefaultValidator)(validators_decorator_1._PROHIBITED_FIELD_PATTERN),
      __metadata('design:type', Array),
    ],
    TakenCoursesQueryDto.prototype,
    'order',
    void 0,
  );
  IUser.TakenCoursesQueryDto = TakenCoursesQueryDto;
  class ReviewLikedQueryDto {}
  __decorate(
    [
      (0, class_validator_1.IsOptional)(),
      (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? [value] : value)),
      (0, class_validator_1.IsArray)(),
      (0, class_validator_1.IsString)({ each: true }),
      (0, validators_decorator_1.OrderDefaultValidator)(validators_decorator_1._PROHIBITED_FIELD_PATTERN),
      __metadata('design:type', Array),
    ],
    ReviewLikedQueryDto.prototype,
    'order',
    void 0,
  );
  __decorate(
    [
      (0, class_validator_1.IsOptional)(),
      (0, class_validator_1.IsNumber)(),
      (0, class_transformer_1.Type)(() => Number),
      __metadata('design:type', Number),
    ],
    ReviewLikedQueryDto.prototype,
    'offset',
    void 0,
  );
  __decorate(
    [
      (0, class_validator_1.IsOptional)(),
      (0, class_validator_1.IsNumber)(),
      (0, class_transformer_1.Type)(() => Number),
      __metadata('design:type', Number),
    ],
    ReviewLikedQueryDto.prototype,
    'limit',
    void 0,
  );
  IUser.ReviewLikedQueryDto = ReviewLikedQueryDto;
})(IUser || (exports.IUser = IUser = {}));
//# sourceMappingURL=IUser.js.map
