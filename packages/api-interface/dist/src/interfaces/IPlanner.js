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
exports.IPlanner = void 0;
const class_transformer_1 = require('class-transformer');
const class_validator_1 = require('class-validator');
const planner_1 = require('@otl/api-interface/src/interfaces/constants/planner');
const validators_decorator_1 = require('@otl/api-interface/src/interfaces/validators.decorator');
var IPlanner;
(function (IPlanner) {
  class QueryDto {}
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
  IPlanner.QueryDto = QueryDto;
  class CreateBodyDto {}
  __decorate(
    [(0, class_validator_1.IsInt)(), __metadata('design:type', Number)],
    CreateBodyDto.prototype,
    'start_year',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsInt)(), __metadata('design:type', Number)],
    CreateBodyDto.prototype,
    'end_year',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsInt)(), __metadata('design:type', Number)],
    CreateBodyDto.prototype,
    'general_track',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsInt)(), __metadata('design:type', Number)],
    CreateBodyDto.prototype,
    'major_track',
    void 0,
  );
  __decorate(
    [
      (0, class_validator_1.IsOptional)(),
      (0, class_validator_1.IsArray)(),
      (0, class_validator_1.IsInt)({ each: true }),
      __metadata('design:type', Array),
    ],
    CreateBodyDto.prototype,
    'additional_tracks',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)(), __metadata('design:type', Boolean)],
    CreateBodyDto.prototype,
    'should_update_taken_semesters',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsArray)(), (0, class_validator_1.IsInt)({ each: true }), __metadata('design:type', Array)],
    CreateBodyDto.prototype,
    'taken_items_to_copy',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsArray)(), (0, class_validator_1.IsInt)({ each: true }), __metadata('design:type', Array)],
    CreateBodyDto.prototype,
    'future_items_to_copy',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsArray)(), (0, class_validator_1.IsInt)({ each: true }), __metadata('design:type', Array)],
    CreateBodyDto.prototype,
    'arbitrary_items_to_copy',
    void 0,
  );
  IPlanner.CreateBodyDto = CreateBodyDto;
  class RemoveItemBodyDto {}
  __decorate(
    [(0, class_validator_1.IsInt)(), __metadata('design:type', Number)],
    RemoveItemBodyDto.prototype,
    'item',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsEnum)(['TAKEN', 'FUTURE', 'ARBITRARY']), __metadata('design:type', String)],
    RemoveItemBodyDto.prototype,
    'item_type',
    void 0,
  );
  IPlanner.RemoveItemBodyDto = RemoveItemBodyDto;
  class ReorderBodyDto {}
  __decorate(
    [(0, class_validator_1.IsInt)(), __metadata('design:type', Number)],
    ReorderBodyDto.prototype,
    'arrange_order',
    void 0,
  );
  IPlanner.ReorderBodyDto = ReorderBodyDto;
  class UpdateItemBodyDto {}
  __decorate(
    [(0, class_validator_1.IsInt)(), __metadata('design:type', Number)],
    UpdateItemBodyDto.prototype,
    'item',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsEnum)(planner_1.PlannerItemType), __metadata('design:type', String)],
    UpdateItemBodyDto.prototype,
    'item_type',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsInt)(), (0, class_validator_1.IsOptional)(), __metadata('design:type', Number)],
    UpdateItemBodyDto.prototype,
    'semester',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)(), __metadata('design:type', Boolean)],
    UpdateItemBodyDto.prototype,
    'is_excluded',
    void 0,
  );
  IPlanner.UpdateItemBodyDto = UpdateItemBodyDto;
  class FuturePlannerItemDto {}
  __decorate(
    [(0, class_validator_1.IsInt)(), (0, class_transformer_1.Type)(() => Number), __metadata('design:type', Number)],
    FuturePlannerItemDto.prototype,
    'course',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsInt)(), (0, class_transformer_1.Type)(() => Number), __metadata('design:type', Number)],
    FuturePlannerItemDto.prototype,
    'year',
    void 0,
  );
  __decorate(
    [
      (0, class_validator_1.IsIn)([1, 2, 3, 4]),
      (0, class_transformer_1.Type)(() => Number),
      __metadata('design:type', Number),
    ],
    FuturePlannerItemDto.prototype,
    'semester',
    void 0,
  );
  IPlanner.FuturePlannerItemDto = FuturePlannerItemDto;
  class AddArbitraryItemDto {}
  __decorate(
    [(0, class_validator_1.IsInt)(), (0, class_transformer_1.Type)(() => Number), __metadata('design:type', Number)],
    AddArbitraryItemDto.prototype,
    'year',
    void 0,
  );
  __decorate(
    [
      (0, class_validator_1.IsIn)([1, 2, 3, 4]),
      (0, class_transformer_1.Type)(() => Number),
      __metadata('design:type', Number),
    ],
    AddArbitraryItemDto.prototype,
    'semester',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsInt)(), (0, class_transformer_1.Type)(() => Number), __metadata('design:type', Number)],
    AddArbitraryItemDto.prototype,
    'department',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsString)(), __metadata('design:type', String)],
    AddArbitraryItemDto.prototype,
    'type',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsString)(), __metadata('design:type', String)],
    AddArbitraryItemDto.prototype,
    'type_en',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsInt)(), (0, class_transformer_1.Type)(() => Number), __metadata('design:type', Number)],
    AddArbitraryItemDto.prototype,
    'credit',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsInt)(), (0, class_transformer_1.Type)(() => Number), __metadata('design:type', Number)],
    AddArbitraryItemDto.prototype,
    'credit_au',
    void 0,
  );
  IPlanner.AddArbitraryItemDto = AddArbitraryItemDto;
  class UpdateBodyDto {}
  __decorate(
    [(0, class_validator_1.IsInt)(), (0, class_transformer_1.Type)(() => Number), __metadata('design:type', Number)],
    UpdateBodyDto.prototype,
    'start_year',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsInt)(), (0, class_transformer_1.Type)(() => Number), __metadata('design:type', Number)],
    UpdateBodyDto.prototype,
    'end_year',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsInt)(), (0, class_transformer_1.Type)(() => Number), __metadata('design:type', Number)],
    UpdateBodyDto.prototype,
    'general_track',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsInt)(), (0, class_transformer_1.Type)(() => Number), __metadata('design:type', Number)],
    UpdateBodyDto.prototype,
    'major_track',
    void 0,
  );
  __decorate(
    [
      (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'number' ? [value] : value)),
      (0, class_validator_1.IsArray)(),
      (0, class_validator_1.IsInt)({ each: true }),
      __metadata('design:type', Array),
    ],
    UpdateBodyDto.prototype,
    'additional_tracks',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)(), __metadata('design:type', Boolean)],
    UpdateBodyDto.prototype,
    'should_update_taken_semesters',
    void 0,
  );
  IPlanner.UpdateBodyDto = UpdateBodyDto;
})(IPlanner || (exports.IPlanner = IPlanner = {}));
//# sourceMappingURL=IPlanner.js.map
