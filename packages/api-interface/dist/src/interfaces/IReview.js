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
exports.IReview = void 0;
const swagger_1 = require('@nestjs/swagger');
const class_transformer_1 = require('class-transformer');
const class_validator_1 = require('class-validator');
const validators_decorator_1 = require('@otl/api-interface/src/interfaces/validators.decorator');
var IReview;
(function (IReview) {
  class LectureReviewsQueryDto {}
  __decorate(
    [
      (0, class_validator_1.IsOptional)(),
      (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? [value] : value)),
      (0, class_validator_1.IsArray)(),
      (0, class_validator_1.IsString)({ each: true }),
      (0, validators_decorator_1.OrderDefaultValidator)(validators_decorator_1._PROHIBITED_FIELD_PATTERN),
      __metadata('design:type', Array),
    ],
    LectureReviewsQueryDto.prototype,
    'order',
    void 0,
  );
  __decorate(
    [
      (0, class_validator_1.IsOptional)(),
      (0, class_validator_1.IsInt)(),
      (0, class_validator_1.Min)(0),
      (0, class_transformer_1.Type)(() => Number),
      __metadata('design:type', Number),
    ],
    LectureReviewsQueryDto.prototype,
    'offset',
    void 0,
  );
  __decorate(
    [
      (0, class_validator_1.IsOptional)(),
      (0, class_validator_1.IsInt)(),
      (0, class_validator_1.Min)(0),
      (0, class_validator_1.Max)(100),
      (0, class_transformer_1.Type)(() => Number),
      __metadata('design:type', Number),
    ],
    LectureReviewsQueryDto.prototype,
    'limit',
    void 0,
  );
  IReview.LectureReviewsQueryDto = LectureReviewsQueryDto;
  class QueryDto {}
  __decorate(
    [
      (0, class_validator_1.IsOptional)(),
      (0, class_validator_1.IsNumber)(),
      (0, class_transformer_1.Type)(() => Number),
      __metadata('design:type', Number),
    ],
    QueryDto.prototype,
    'lecture_year',
    void 0,
  );
  __decorate(
    [
      (0, class_validator_1.IsOptional)(),
      (0, class_validator_1.IsNumber)(),
      (0, class_transformer_1.Type)(() => Number),
      __metadata('design:type', Number),
    ],
    QueryDto.prototype,
    'lecture_semester',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), __metadata('design:type', String)],
    QueryDto.prototype,
    'response_type',
    void 0,
  );
  __decorate(
    [
      (0, class_validator_1.IsOptional)(),
      (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? [value] : value)),
      (0, class_validator_1.IsArray)(),
      (0, class_validator_1.IsString)({ each: true }),
      (0, validators_decorator_1.OrderDefaultValidator)(validators_decorator_1._PROHIBITED_FIELD_PATTERN),
      __metadata('design:type', Array),
    ],
    QueryDto.prototype,
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
    QueryDto.prototype,
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
    QueryDto.prototype,
    'limit',
    void 0,
  );
  IReview.QueryDto = QueryDto;
  class CreateDto {}
  __decorate(
    [
      (0, swagger_1.ApiProperty)(),
      (0, class_validator_1.IsString)(),
      (0, class_validator_1.IsNotEmpty)(),
      (0, class_validator_1.Validate)(validators_decorator_1.StringStripLength),
      __metadata('design:type', String),
    ],
    CreateDto.prototype,
    'content',
    void 0,
  );
  __decorate(
    [
      (0, swagger_1.ApiProperty)(),
      (0, class_validator_1.IsNumber)(),
      (0, class_validator_1.IsNotEmpty)(),
      (0, class_transformer_1.Type)(() => Number),
      __metadata('design:type', Number),
    ],
    CreateDto.prototype,
    'lecture',
    void 0,
  );
  __decorate(
    [
      (0, swagger_1.ApiProperty)(),
      (0, class_validator_1.IsNumber)(),
      (0, class_validator_1.IsNotEmpty)(),
      (0, class_validator_1.Min)(1),
      (0, class_validator_1.Max)(5),
      (0, class_transformer_1.Type)(() => Number),
      __metadata('design:type', Number),
    ],
    CreateDto.prototype,
    'grade',
    void 0,
  );
  __decorate(
    [
      (0, swagger_1.ApiProperty)(),
      (0, class_validator_1.IsNumber)(),
      (0, class_validator_1.IsNotEmpty)(),
      (0, class_validator_1.Min)(1),
      (0, class_validator_1.Max)(5),
      (0, class_transformer_1.Type)(() => Number),
      __metadata('design:type', Number),
    ],
    CreateDto.prototype,
    'load',
    void 0,
  );
  __decorate(
    [
      (0, swagger_1.ApiProperty)(),
      (0, class_validator_1.IsNumber)(),
      (0, class_validator_1.IsNotEmpty)(),
      (0, class_validator_1.Min)(1),
      (0, class_validator_1.Max)(5),
      (0, class_transformer_1.Type)(() => Number),
      __metadata('design:type', Number),
    ],
    CreateDto.prototype,
    'speech',
    void 0,
  );
  IReview.CreateDto = CreateDto;
  class UpdateDto extends (0, swagger_1.PartialType)((0, swagger_1.OmitType)(IReview.CreateDto, ['lecture'])) {}
  IReview.UpdateDto = UpdateDto;
})(IReview || (exports.IReview = IReview = {}));
//# sourceMappingURL=IReview.js.map
