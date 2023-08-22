import { ValidationArguments, registerDecorator } from "class-validator";

// todo: timetable 브랜치와 merge 후 삭제 필요
export const _PROHIBITED_FIELD_PATTERN: RegExp[] = [
  /user/,
  /profile/,
  /owner/,
  /writer/,
  /__.*__/,
  /\?/,
];


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