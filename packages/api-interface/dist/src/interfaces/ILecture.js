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
exports.ILecture = void 0;
const class_transformer_1 = require('class-transformer');
const class_validator_1 = require('class-validator');
const ICourse_1 = require('@otl/api-interface/src/interfaces/ICourse');
const class_transformer_2 = require('class-transformer');
const class_validator_2 = require('class-validator');
var ILecture;
(function (ILecture) {
  class QueryDto extends ICourse_1.ICourse.Query {}
  __decorate(
    [
      (0, class_validator_2.IsOptional)(),
      (0, class_transformer_2.Transform)(({ value }) => parseInt(value)),
      (0, class_validator_2.IsNumber)(),
      __metadata('design:type', Number),
    ],
    QueryDto.prototype,
    'year',
    void 0,
  );
  __decorate(
    [
      (0, class_validator_2.IsOptional)(),
      (0, class_transformer_2.Transform)(({ value }) => parseInt(value)),
      (0, class_validator_2.IsNumber)(),
      __metadata('design:type', Number),
    ],
    QueryDto.prototype,
    'semester',
    void 0,
  );
  __decorate(
    [
      (0, class_validator_2.IsOptional)(),
      (0, class_transformer_2.Transform)(({ value }) => parseInt(value)),
      (0, class_validator_2.IsNumber)(),
      __metadata('design:type', Number),
    ],
    QueryDto.prototype,
    'day',
    void 0,
  );
  __decorate(
    [
      (0, class_validator_2.IsOptional)(),
      (0, class_transformer_2.Transform)(({ value }) => parseInt(value)),
      (0, class_validator_2.IsNumber)(),
      __metadata('design:type', Number),
    ],
    QueryDto.prototype,
    'begin',
    void 0,
  );
  __decorate(
    [
      (0, class_validator_2.IsOptional)(),
      (0, class_transformer_2.Transform)(({ value }) => parseInt(value)),
      (0, class_validator_2.IsNumber)(),
      __metadata('design:type', Number),
    ],
    QueryDto.prototype,
    'end',
    void 0,
  );
  ILecture.QueryDto = QueryDto;
  class AutocompleteQueryDto {}
  __decorate(
    [(0, class_validator_1.IsInt)(), (0, class_transformer_1.Type)(() => Number), __metadata('design:type', Number)],
    AutocompleteQueryDto.prototype,
    'year',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsInt)(), (0, class_transformer_1.Type)(() => Number), __metadata('design:type', Number)],
    AutocompleteQueryDto.prototype,
    'semester',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsString)(), __metadata('design:type', String)],
    AutocompleteQueryDto.prototype,
    'keyword',
    void 0,
  );
  ILecture.AutocompleteQueryDto = AutocompleteQueryDto;
})(ILecture || (exports.ILecture = ILecture = {}));
//# sourceMappingURL=ILecture.js.map
