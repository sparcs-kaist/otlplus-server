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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.StringStripLength = exports._PROHIBITED_FIELD_PATTERN = void 0;
exports.RegexValidator = RegexValidator;
exports.InverseRegexValidator = InverseRegexValidator;
exports.CronValidator = CronValidator;
exports.OrderDefaultValidator = OrderDefaultValidator;
const class_validator_1 = require('class-validator');
const cron_validator_1 = __importDefault(require('cron-validator'));
exports._PROHIBITED_FIELD_PATTERN = [/user/, /profile/, /owner/, /writer/, /__.*__/, /\?/];
function RegexValidator(regexExps, validationOptions) {
  return function (object, propertyName) {
    (0, class_validator_1.registerDecorator)({
      name: 'regexValidator',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: regexExps,
      validator: {
        validate(order, args) {
          return order.every((o) => {
            return regexExps.every((p) => p.test(o));
          });
        },
        defaultMessage(validationArguments) {
          return 'Only alphanumeric characters are allowed';
        },
      },
    });
  };
}
function InverseRegexValidator(regexExps, validationOptions) {
  return function (object, propertyName) {
    (0, class_validator_1.registerDecorator)({
      name: 'regexValidator',
      target: object.constructor,
      propertyName: propertyName,
      constraints: regexExps,
      options: validationOptions,
      validator: {
        validate(order, args) {
          return order.every((o) => {
            return regexExps.every((p) => !p.test(o));
          });
        },
        defaultMessage(validationArguments) {
          return 'Only alphanumeric characters are allowed';
        },
      },
    });
  };
}
function CronValidator(validationOptions) {
  return function (object, propertyName) {
    (0, class_validator_1.registerDecorator)({
      name: 'CronValidator',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value, args) {
          return cron_validator_1.default.isValidCron(value, { seconds: true });
        },
        defaultMessage(validationArguments) {
          return 'Invalid cron expression';
        },
      },
    });
  };
}
function OrderDefaultValidator(regexExps, validationOptions) {
  return function (object, propertyName) {
    (0, class_validator_1.registerDecorator)({
      name: 'OrderDefaultValidator',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: regexExps,
      validator: {
        validate(order, args) {
          return order.every((o) => {
            return regexExps.every((p) => !p.test(o));
          });
        },
        defaultMessage(validationArguments) {
          return 'Only alphanumeric characters are allowed';
        },
      },
    });
  };
}
let StringStripLength = class StringStripLength {
  validate(text) {
    return text?.trim().length > 0;
  }
  defaultMessage(args) {
    return "Body 'content' did not pass validator: content must not be empty";
  }
};
exports.StringStripLength = StringStripLength;
exports.StringStripLength = StringStripLength = __decorate(
  [(0, class_validator_1.ValidatorConstraint)({ name: 'STRING_STRIP_LENGTH', async: false })],
  StringStripLength,
);
//# sourceMappingURL=validators.decorator.js.map
