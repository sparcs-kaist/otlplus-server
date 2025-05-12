import { ValidationArguments, ValidatorConstraintInterface } from 'class-validator';
export declare const _PROHIBITED_FIELD_PATTERN: RegExp[];
export declare function RegexValidator(
  regexExps: RegExp[],
  validationOptions?: {
    message?: string;
  },
): (object: object, propertyName: string) => void;
export declare function InverseRegexValidator(
  regexExps: RegExp[],
  validationOptions?: {
    message?: string;
  },
): (object: object, propertyName: string) => void;
export declare function CronValidator(validationOptions?: {
  message?: string;
}): (object: object, propertyName: string) => void;
export declare function OrderDefaultValidator(
  regexExps: RegExp[],
  validationOptions?: {
    message?: string;
  },
): (object: object, propertyName: string) => void;
export declare class StringStripLength implements ValidatorConstraintInterface {
  validate(text: string): boolean;
  defaultMessage(args: ValidationArguments): string;
}
