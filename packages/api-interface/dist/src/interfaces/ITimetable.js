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
exports.ITimetable = exports.TIMETABLE_MAX_LIMIT = void 0;
const validators_decorator_1 = require('@otl/api-interface/src/interfaces/validators.decorator');
const class_transformer_1 = require('class-transformer');
const class_validator_1 = require('class-validator');
exports.TIMETABLE_MAX_LIMIT = 50;
var ITimetable;
(function (ITimetable) {
  class QueryDto {}
  __decorate(
    [
      (0, class_validator_1.IsOptional)(),
      (0, class_validator_1.IsNumber)(),
      (0, class_transformer_1.Type)(() => Number),
      __metadata('design:type', Number),
    ],
    QueryDto.prototype,
    'year',
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
    'semester',
    void 0,
  );
  __decorate(
    [
      (0, validators_decorator_1.OrderDefaultValidator)(validators_decorator_1._PROHIBITED_FIELD_PATTERN),
      (0, class_validator_1.IsOptional)(),
      (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? [value] : value)),
      (0, class_validator_1.IsArray)(),
      (0, class_validator_1.IsString)({ each: true }),
      __metadata('design:type', Array),
    ],
    QueryDto.prototype,
    'order',
    void 0,
  );
  __decorate(
    [
      (0, class_validator_1.IsOptional)(),
      (0, class_transformer_1.Transform)(({ value }) => value ?? 0),
      (0, class_validator_1.IsNumber)(),
      __metadata('design:type', Number),
    ],
    QueryDto.prototype,
    'offset',
    void 0,
  );
  __decorate(
    [
      (0, class_validator_1.IsOptional)(),
      (0, class_transformer_1.Transform)(({ value }) => value ?? exports.TIMETABLE_MAX_LIMIT),
      (0, class_validator_1.IsNumber)(),
      __metadata('design:type', Number),
    ],
    QueryDto.prototype,
    'limit',
    void 0,
  );
  ITimetable.QueryDto = QueryDto;
  class CreateDto {}
  __decorate(
    [(0, class_validator_1.IsNumber)(), __metadata('design:type', Number)],
    CreateDto.prototype,
    'year',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsNumber)(), __metadata('design:type', Number)],
    CreateDto.prototype,
    'semester',
    void 0,
  );
  __decorate(
    [
      (0, class_validator_1.IsArray)(),
      (0, class_validator_1.IsNumber)({}, { each: true }),
      __metadata('design:type', Array),
    ],
    CreateDto.prototype,
    'lectures',
    void 0,
  );
  ITimetable.CreateDto = CreateDto;
  class AddLectureDto {}
  __decorate(
    [(0, class_validator_1.IsNumber)(), (0, class_transformer_1.Type)(() => Number), __metadata('design:type', Number)],
    AddLectureDto.prototype,
    'lecture',
    void 0,
  );
  ITimetable.AddLectureDto = AddLectureDto;
  class ReorderTimetableDto {}
  __decorate(
    [(0, class_validator_1.IsNumber)(), (0, class_transformer_1.Type)(() => Number), __metadata('design:type', Number)],
    ReorderTimetableDto.prototype,
    'arrange_order',
    void 0,
  );
  ITimetable.ReorderTimetableDto = ReorderTimetableDto;
})(ITimetable || (exports.ITimetable = ITimetable = {}));
//# sourceMappingURL=ITimetable.js.map
