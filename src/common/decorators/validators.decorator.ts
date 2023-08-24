import {
  registerDecorator,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from "class-validator";

export const _PROHIBITED_FIELD_PATTERN: RegExp[] = [
  /user/,
  /profile/,
  /owner/,
  /writer/,
  /__.*__/,
  /\?/,
];

export function RegexValidator(
  regexExps: RegExp[],
  validationOptions?: { message?: string }
) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, propertyName: string) {
    registerDecorator({
      name: "regexValidator",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: regexExps,
      validator: {
        validate(order: string[], args: ValidationArguments): boolean {
          return order.every((o) => {
            return regexExps.every((p) => p.test(o));
          });
        },

        defaultMessage(validationArguments?: ValidationArguments): string {
          return "Only alphanumeric characters are allowed";
        }
      }
    });
  };
}

export function InverseRegexValidator(
  regexExps: RegExp[],
  validationOptions?: { message?: string }
) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, propertyName: string) {
    registerDecorator({
      name: "regexValidator",
      target: object.constructor,
      propertyName: propertyName,
      constraints: regexExps,
      options: validationOptions,
      validator: {
        validate(order: string[], args: ValidationArguments): boolean {
          return order.every((o) => {
            return regexExps.every((p) => !p.test(o));
          });
        },

        defaultMessage(validationArguments?: ValidationArguments): string {
          return "Only alphanumeric characters are allowed";
        }
      }
    });
  };
}



export function OrderDefaultValidator(
  regexExps: RegExp[],
  validationOptions?: { message?: string },
) {
  return function (object:object, propertyName: string) {
    registerDecorator({
      name: 'OrderDefaultValidator',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: regexExps,
      validator: {
        validate(order: string[], args: ValidationArguments): boolean {
          return order.every((o) => {
            return regexExps.every((p) => !p.test(o));
          });
        },
        defaultMessage(validationArguments?: ValidationArguments): string {
          return 'Only alphanumeric characters are allowed';
        },
      },
    });
  };
}

@ValidatorConstraint({ name: 'STRING_STRIP_LENGTH', async: false })
export class StringStripLength implements ValidatorConstraintInterface {
  validate(text: string): boolean {
    return text?.trim().length > 0;
  }

  defaultMessage(args: ValidationArguments): string {
    return "Body 'content' did not pass validator: content must not be empty";
  }
}