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
exports.ICourse = void 0;
const class_transformer_1 = require('class-transformer');
const class_validator_1 = require('class-validator');
var ICourse;
(function (ICourse) {
  class AutocompleteQueryDto {}
  __decorate(
    [(0, class_validator_1.IsString)(), __metadata('design:type', String)],
    AutocompleteQueryDto.prototype,
    'keyword',
    void 0,
  );
  ICourse.AutocompleteQueryDto = AutocompleteQueryDto;
  class Query {}
  __decorate(
    [
      (0, class_validator_1.IsOptional)(),
      (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? [value] : value)),
      (0, class_validator_1.IsArray)(),
      (0, class_validator_1.IsString)({ each: true }),
      __metadata('design:type', Array),
    ],
    Query.prototype,
    'department',
    void 0,
  );
  __decorate(
    [
      (0, class_validator_1.IsOptional)(),
      (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? [value] : value)),
      (0, class_validator_1.IsArray)(),
      (0, class_validator_1.IsString)({ each: true }),
      __metadata('design:type', Array),
    ],
    Query.prototype,
    'type',
    void 0,
  );
  __decorate(
    [
      (0, class_validator_1.IsOptional)(),
      (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? [value] : value)),
      (0, class_validator_1.IsArray)(),
      (0, class_validator_1.IsString)({ each: true }),
      __metadata('design:type', Array),
    ],
    Query.prototype,
    'level',
    void 0,
  );
  __decorate(
    [
      (0, class_validator_1.IsOptional)(),
      (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? [value] : value)),
      (0, class_validator_1.IsArray)(),
      (0, class_validator_1.IsString)({ each: true }),
      __metadata('design:type', Array),
    ],
    Query.prototype,
    'group',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), __metadata('design:type', String)],
    Query.prototype,
    'keyword',
    void 0,
  );
  __decorate(
    [
      (0, class_validator_1.IsOptional)(),
      (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? [value] : value)),
      (0, class_validator_1.IsArray)(),
      (0, class_validator_1.IsString)({ each: true }),
      __metadata('design:type', Array),
    ],
    Query.prototype,
    'term',
    void 0,
  );
  __decorate(
    [
      (0, class_validator_1.IsOptional)(),
      (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? [value] : value)),
      (0, class_validator_1.IsArray)(),
      (0, class_validator_1.IsString)({ each: true }),
      __metadata('design:type', Array),
    ],
    Query.prototype,
    'order',
    void 0,
  );
  __decorate(
    [
      (0, class_validator_1.IsOptional)(),
      (0, class_validator_1.IsNumber)(),
      (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
      __metadata('design:type', Number),
    ],
    Query.prototype,
    'offset',
    void 0,
  );
  __decorate(
    [
      (0, class_validator_1.IsOptional)(),
      (0, class_validator_1.IsNumber)(),
      (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
      __metadata('design:type', Number),
    ],
    Query.prototype,
    'limit',
    void 0,
  );
  ICourse.Query = Query;
  class LectureQueryDto {}
  __decorate(
    [
      (0, class_validator_1.IsOptional)(),
      (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? [value] : value)),
      (0, class_validator_1.IsArray)(),
      (0, class_validator_1.IsString)({ each: true }),
      __metadata('design:type', Array),
    ],
    LectureQueryDto.prototype,
    'order',
    void 0,
  );
  ICourse.LectureQueryDto = LectureQueryDto;
  class ReviewQueryDto {}
  __decorate(
    [
      (0, class_validator_1.IsOptional)(),
      (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? [value] : value)),
      (0, class_validator_1.IsArray)(),
      (0, class_validator_1.IsString)({ each: true }),
      __metadata('design:type', Array),
    ],
    ReviewQueryDto.prototype,
    'order',
    void 0,
  );
  __decorate(
    [
      (0, class_validator_1.IsOptional)(),
      (0, class_validator_1.IsNumber)(),
      (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
      (0, class_validator_1.Min)(0, { message: 'Offset must be a non-negative number' }),
      __metadata('design:type', Number),
    ],
    ReviewQueryDto.prototype,
    'offset',
    void 0,
  );
  __decorate(
    [
      (0, class_validator_1.IsOptional)(),
      (0, class_validator_1.IsNumber)(),
      (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
      (0, class_validator_1.Min)(0, { message: 'limit must be a non-negative number' }),
      (0, class_validator_1.Max)(100, { message: 'limit must be less than or equal to 100' }),
      __metadata('design:type', Number),
    ],
    ReviewQueryDto.prototype,
    'limit',
    void 0,
  );
  ICourse.ReviewQueryDto = ReviewQueryDto;
})(ICourse || (exports.ICourse = ICourse = {}));
//# sourceMappingURL=ICourse.js.map
