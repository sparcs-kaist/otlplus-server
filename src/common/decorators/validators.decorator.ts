import { registerDecorator, ValidationArguments } from "class-validator";

export const _PROHIBITED_FIELD_PATTERN: RegExp[] = [
  /user/, /profile/, /owner/, /writer/,
  /__.*__/, /\?/
];


export function RegexValidator(
  regexExps: RegExp[],
  validationOptions?: { message?: string }
) {
  return function(object: Object, propertyName: string) {
    registerDecorator({
      name: "regexValidator",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: regexExps,
      validator: {
        validate(value: string[], args: ValidationArguments) {
          const results = value.map((v) => {
            if (typeof value !== "string") return false;
            const regexExps = args.constraints;
            for (const regexExp of regexExps) {
              if (!regexExp.test(value)) return false;
            }
            return true;
          });
          return results.every((v) => v === true);
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
  return function(object: Object, propertyName: string) {
    registerDecorator({
      name: "regexValidator",
      target: object.constructor,
      propertyName: propertyName,
      constraints: regexExps,
      options: validationOptions,
      validator: {
        validate(value: string[], args: ValidationArguments) {
          const results = value.map((v) => {
            if (typeof v !== "string") return false;
            const regexExps: RegExp[] = args.constraints;
            for (const regexExp of regexExps) {
              if (regexExp.test(v)) return false;
            }
            return true;
          });
          return !results.some((v) => v === false);
        },

        defaultMessage(validationArguments?: ValidationArguments): string {
          return "Only alphanumeric characters are allowed";
        }
      }
    });
  };
}