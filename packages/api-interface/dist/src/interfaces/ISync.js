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
exports.ISync = void 0;
const class_transformer_1 = require('class-transformer');
const class_validator_1 = require('class-validator');
var ISync;
(function (ISync) {
  class ScholarDBBody {}
  __decorate(
    [(0, class_validator_1.IsInt)(), __metadata('design:type', Number)],
    ScholarDBBody.prototype,
    'year',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsIn)([1, 2, 3, 4]), __metadata('design:type', Number)],
    ScholarDBBody.prototype,
    'semester',
    void 0,
  );
  __decorate(
    [
      (0, class_transformer_1.Type)(() => ScholarLectureType),
      (0, class_validator_1.ValidateNested)(),
      __metadata('design:type', Array),
    ],
    ScholarDBBody.prototype,
    'lectures',
    void 0,
  );
  __decorate(
    [
      (0, class_transformer_1.Type)(() => ScholarChargeType),
      (0, class_validator_1.ValidateNested)(),
      __metadata('design:type', Array),
    ],
    ScholarDBBody.prototype,
    'charges',
    void 0,
  );
  ISync.ScholarDBBody = ScholarDBBody;
  class ScholarLectureType {}
  __decorate(
    [
      (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
      (0, class_validator_1.IsInt)(),
      __metadata('design:type', Number),
    ],
    ScholarLectureType.prototype,
    'LECTURE_YEAR',
    void 0,
  );
  __decorate(
    [
      (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
      (0, class_validator_1.IsIn)([1, 2, 3, 4]),
      __metadata('design:type', Number),
    ],
    ScholarLectureType.prototype,
    'LECTURE_TERM',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsString)(), __metadata('design:type', String)],
    ScholarLectureType.prototype,
    'SUBJECT_NO',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsString)(), __metadata('design:type', String)],
    ScholarLectureType.prototype,
    'LECTURE_CLASS',
    void 0,
  );
  __decorate(
    [
      (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
      (0, class_validator_1.IsInt)(),
      __metadata('design:type', Number),
    ],
    ScholarLectureType.prototype,
    'DEPT_ID',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsString)(), __metadata('design:type', String)],
    ScholarLectureType.prototype,
    'DEPT_NAME',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsString)(), __metadata('design:type', String)],
    ScholarLectureType.prototype,
    'E_DEPT_NAME',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsString)(), __metadata('design:type', String)],
    ScholarLectureType.prototype,
    'SUB_TITLE',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsString)(), __metadata('design:type', String)],
    ScholarLectureType.prototype,
    'E_SUB_TITLE',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsString)(), __metadata('design:type', String)],
    ScholarLectureType.prototype,
    'SUBJECT_ID',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsString)(), __metadata('design:type', String)],
    ScholarLectureType.prototype,
    'SUBJECT_TYPE',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsString)(), __metadata('design:type', String)],
    ScholarLectureType.prototype,
    'E_SUBJECT_TYPE',
    void 0,
  );
  __decorate(
    [
      (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
      (0, class_validator_1.IsInt)(),
      __metadata('design:type', Number),
    ],
    ScholarLectureType.prototype,
    'COURSE_SECT',
    void 0,
  );
  __decorate(
    [
      (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
      (0, class_validator_1.IsInt)(),
      __metadata('design:type', Number),
    ],
    ScholarLectureType.prototype,
    'ACT_UNIT',
    void 0,
  );
  __decorate(
    [
      (0, class_transformer_1.Transform)(({ value }) => parseFloat(value)),
      (0, class_validator_1.IsNumber)(),
      __metadata('design:type', Number),
    ],
    ScholarLectureType.prototype,
    'LECTURE',
    void 0,
  );
  __decorate(
    [
      (0, class_transformer_1.Transform)(({ value }) => parseFloat(value)),
      (0, class_validator_1.IsNumber)(),
      __metadata('design:type', Number),
    ],
    ScholarLectureType.prototype,
    'LAB',
    void 0,
  );
  __decorate(
    [
      (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
      (0, class_validator_1.IsInt)(),
      __metadata('design:type', Number),
    ],
    ScholarLectureType.prototype,
    'CREDIT',
    void 0,
  );
  __decorate(
    [
      (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
      (0, class_validator_1.IsInt)(),
      __metadata('design:type', Number),
    ],
    ScholarLectureType.prototype,
    'LIMIT',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsString)(), __metadata('design:type', String)],
    ScholarLectureType.prototype,
    'PROF_NAMES',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsString)(), __metadata('design:type', String)],
    ScholarLectureType.prototype,
    'NOTICE',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsString)(), __metadata('design:type', String)],
    ScholarLectureType.prototype,
    'OLD_NO',
    void 0,
  );
  __decorate(
    [
      (0, class_validator_1.IsIn)(['Y', 'N', ''], { message: (args) => JSON.stringify(args) }),
      __metadata('design:type', String),
    ],
    ScholarLectureType.prototype,
    'ENGLISH_LEC',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsString)(), __metadata('design:type', String)],
    ScholarLectureType.prototype,
    'E_PROF_NAMES',
    void 0,
  );
  ISync.ScholarLectureType = ScholarLectureType;
  class ScholarChargeType {}
  __decorate(
    [
      (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
      (0, class_validator_1.IsInt)(),
      __metadata('design:type', Number),
    ],
    ScholarChargeType.prototype,
    'LECTURE_YEAR',
    void 0,
  );
  __decorate(
    [
      (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
      (0, class_validator_1.IsIn)([1, 2, 3, 4]),
      __metadata('design:type', Number),
    ],
    ScholarChargeType.prototype,
    'LECTURE_TERM',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsString)(), __metadata('design:type', String)],
    ScholarChargeType.prototype,
    'SUBJECT_NO',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsString)(), __metadata('design:type', String)],
    ScholarChargeType.prototype,
    'LECTURE_CLASS',
    void 0,
  );
  __decorate(
    [
      (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
      (0, class_validator_1.IsInt)(),
      __metadata('design:type', Number),
    ],
    ScholarChargeType.prototype,
    'DEPT_ID',
    void 0,
  );
  __decorate(
    [
      (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
      (0, class_validator_1.IsInt)(),
      __metadata('design:type', Number),
    ],
    ScholarChargeType.prototype,
    'PROF_ID',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsString)(), __metadata('design:type', String)],
    ScholarChargeType.prototype,
    'PROF_NAME',
    void 0,
  );
  __decorate(
    [
      (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
      (0, class_validator_1.IsNumber)(),
      __metadata('design:type', Number),
    ],
    ScholarChargeType.prototype,
    'PORTION',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), __metadata('design:type', Object)],
    ScholarChargeType.prototype,
    'E_PROF_NAME',
    void 0,
  );
  ISync.ScholarChargeType = ScholarChargeType;
  class ExamtimeBody {}
  __decorate(
    [(0, class_validator_1.IsInt)(), __metadata('design:type', Number)],
    ExamtimeBody.prototype,
    'year',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsIn)([1, 2, 3, 4]), __metadata('design:type', Number)],
    ExamtimeBody.prototype,
    'semester',
    void 0,
  );
  __decorate(
    [
      (0, class_transformer_1.Type)(() => ExamtimeType),
      (0, class_validator_1.ValidateNested)({ each: true }),
      __metadata('design:type', Array),
    ],
    ExamtimeBody.prototype,
    'examtimes',
    void 0,
  );
  ISync.ExamtimeBody = ExamtimeBody;
  class ExamtimeType {}
  __decorate(
    [
      (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
      (0, class_validator_1.IsInt)(),
      __metadata('design:type', Number),
    ],
    ExamtimeType.prototype,
    'LECTURE_YEAR',
    void 0,
  );
  __decorate(
    [
      (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
      (0, class_validator_1.IsIn)([1, 2, 3, 4]),
      __metadata('design:type', Number),
    ],
    ExamtimeType.prototype,
    'LECTURE_TERM',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsString)(), __metadata('design:type', String)],
    ExamtimeType.prototype,
    'SUBJECT_NO',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsString)(), __metadata('design:type', String)],
    ExamtimeType.prototype,
    'LECTURE_CLASS',
    void 0,
  );
  __decorate(
    [
      (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
      (0, class_validator_1.IsInt)(),
      __metadata('design:type', Number),
    ],
    ExamtimeType.prototype,
    'DEPT_ID',
    void 0,
  );
  __decorate(
    [
      (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
      (0, class_validator_1.IsInt)(),
      __metadata('design:type', Number),
    ],
    ExamtimeType.prototype,
    'EXAM_DAY',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsString)(), __metadata('design:type', String)],
    ExamtimeType.prototype,
    'EXAM_BEGIN',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsString)(), __metadata('design:type', String)],
    ExamtimeType.prototype,
    'EXAM_END',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsString)(), __metadata('design:type', String)],
    ExamtimeType.prototype,
    'NOTICE',
    void 0,
  );
  ISync.ExamtimeType = ExamtimeType;
  class ClasstimeBody {}
  __decorate(
    [(0, class_validator_1.IsInt)(), __metadata('design:type', Number)],
    ClasstimeBody.prototype,
    'year',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsIn)([1, 2, 3, 4]), __metadata('design:type', Number)],
    ClasstimeBody.prototype,
    'semester',
    void 0,
  );
  __decorate(
    [
      (0, class_transformer_1.Type)(() => ClasstimeType),
      (0, class_validator_1.ValidateNested)({ each: true }),
      __metadata('design:type', Array),
    ],
    ClasstimeBody.prototype,
    'classtimes',
    void 0,
  );
  ISync.ClasstimeBody = ClasstimeBody;
  function timeDayConverter(dayString) {
    const dayNumber = parseInt(dayString);
    if (dayNumber < 1 || dayNumber > 7) {
      throw new Error('Invalid day number. Must be between 1 and 7.');
    }
    const day = dayNumber === 1 ? 7 : dayNumber - 1;
    return day - 1;
  }
  class ClasstimeType {}
  __decorate(
    [
      (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
      (0, class_validator_1.IsInt)(),
      __metadata('design:type', Number),
    ],
    ClasstimeType.prototype,
    'LECTURE_YEAR',
    void 0,
  );
  __decorate(
    [
      (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
      (0, class_validator_1.IsIn)([1, 2, 3, 4]),
      __metadata('design:type', Number),
    ],
    ClasstimeType.prototype,
    'LECTURE_TERM',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsString)(), __metadata('design:type', String)],
    ClasstimeType.prototype,
    'SUBJECT_NO',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsString)(), __metadata('design:type', String)],
    ClasstimeType.prototype,
    'LECTURE_CLASS',
    void 0,
  );
  __decorate(
    [
      (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
      (0, class_validator_1.IsInt)(),
      __metadata('design:type', Number),
    ],
    ClasstimeType.prototype,
    'DEPT_ID',
    void 0,
  );
  __decorate(
    [
      (0, class_validator_1.IsNumber)(),
      (0, class_transformer_1.Transform)(({ value }) => timeDayConverter(value)),
      __metadata('design:type', Number),
    ],
    ClasstimeType.prototype,
    'LECTURE_DAY',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsString)(), __metadata('design:type', String)],
    ClasstimeType.prototype,
    'LECTURE_BEGIN',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsString)(), __metadata('design:type', String)],
    ClasstimeType.prototype,
    'LECTURE_END',
    void 0,
  );
  __decorate(
    [
      (0, class_transformer_1.Transform)(({ value }) => value.toLowerCase()),
      (0, class_validator_1.IsIn)(['l', 'e']),
      __metadata('design:type', String),
    ],
    ClasstimeType.prototype,
    'LECTURE_TYPE',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsString)(), __metadata('design:type', String)],
    ClasstimeType.prototype,
    'BUILDING',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsString)(), __metadata('design:type', String)],
    ClasstimeType.prototype,
    'ROOM_NO',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsString)(), __metadata('design:type', String)],
    ClasstimeType.prototype,
    'ROOM_K_NAME',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsString)(), __metadata('design:type', String)],
    ClasstimeType.prototype,
    'ROOM_E_NAME',
    void 0,
  );
  __decorate(
    [
      (0, class_validator_1.IsNumber)(),
      (0, class_validator_1.IsOptional)(),
      (0, class_transformer_1.Transform)(({ value }) => {
        if (value === '' || value === null || value === undefined) {
          return null;
        }
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? null : parsed;
      }),
      __metadata('design:type', Object),
    ],
    ClasstimeType.prototype,
    'TEACHING',
    void 0,
  );
  ISync.ClasstimeType = ClasstimeType;
  class TakenLectureBody {}
  __decorate(
    [(0, class_validator_1.IsInt)(), __metadata('design:type', Number)],
    TakenLectureBody.prototype,
    'year',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsIn)([1, 2, 3, 4]), __metadata('design:type', Number)],
    TakenLectureBody.prototype,
    'semester',
    void 0,
  );
  __decorate(
    [
      (0, class_transformer_1.Type)(() => AttendType),
      (0, class_validator_1.ValidateNested)({ each: true }),
      __metadata('design:type', Array),
    ],
    TakenLectureBody.prototype,
    'attend',
    void 0,
  );
  ISync.TakenLectureBody = TakenLectureBody;
  class AttendType {}
  __decorate(
    [
      (0, class_validator_1.IsInt)(),
      (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
      __metadata('design:type', Number),
    ],
    AttendType.prototype,
    'LECTURE_YEAR',
    void 0,
  );
  __decorate(
    [
      (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
      (0, class_validator_1.IsIn)([1, 2, 3, 4]),
      __metadata('design:type', Number),
    ],
    AttendType.prototype,
    'LECTURE_TERM',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsString)(), __metadata('design:type', String)],
    AttendType.prototype,
    'SUBJECT_NO',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsString)(), __metadata('design:type', String)],
    AttendType.prototype,
    'LECTURE_CLASS',
    void 0,
  );
  __decorate(
    [
      (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
      (0, class_validator_1.IsInt)(),
      __metadata('design:type', Number),
    ],
    AttendType.prototype,
    'DEPT_ID',
    void 0,
  );
  __decorate(
    [
      (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
      (0, class_validator_1.IsInt)(),
      __metadata('design:type', Number),
    ],
    AttendType.prototype,
    'STUDENT_NO',
    void 0,
  );
  __decorate(
    [(0, class_validator_1.IsIn)(['I', 'C']), __metadata('design:type', String)],
    AttendType.prototype,
    'PROCESS_TYPE',
    void 0,
  );
  ISync.AttendType = AttendType;
  class CronExpress {}
  ISync.CronExpress = CronExpress;
  class SyncTerm {}
  __decorate(
    [
      (0, class_validator_1.IsOptional)(),
      (0, class_validator_1.IsNumber)(),
      (0, class_transformer_1.Type)(() => Number),
      __metadata('design:type', Number),
    ],
    SyncTerm.prototype,
    'year',
    void 0,
  );
  __decorate(
    [
      (0, class_validator_1.IsOptional)(),
      (0, class_validator_1.IsIn)([1, 2, 3, 4]),
      (0, class_validator_1.IsNumber)(),
      (0, class_transformer_1.Type)(() => Number),
      __metadata('design:type', Number),
    ],
    SyncTerm.prototype,
    'semester',
    void 0,
  );
  __decorate(
    [
      (0, class_validator_1.IsOptional)(),
      (0, class_validator_1.IsNumber)(),
      (0, class_transformer_1.Type)(() => Number),
      __metadata('design:type', Number),
    ],
    SyncTerm.prototype,
    'interval',
    void 0,
  );
  ISync.SyncTerm = SyncTerm;
  class SyncResultSummaries {
    constructor() {
      this.results = [];
    }
  }
  ISync.SyncResultSummaries = SyncResultSummaries;
  class SyncResultSummary {}
  ISync.SyncResultSummary = SyncResultSummary;
  class SyncResultDetails {
    constructor() {
      this.results = [];
    }
  }
  ISync.SyncResultDetails = SyncResultDetails;
  class SyncResultDetail {
    constructor(type) {
      this.type = type;
      this.created = [];
      this.updated = [];
      this.skipped = [];
      this.errors = [];
      this.deleted = [];
    }
  }
  ISync.SyncResultDetail = SyncResultDetail;
})(ISync || (exports.ISync = ISync = {}));
//# sourceMappingURL=ISync.js.map
