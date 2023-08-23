import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';


@ValidatorConstraint({ name: 'STRING_STRIP_LENGTH', async: false })
export class StringStripLength implements ValidatorConstraintInterface {
  validate(text: string): boolean {
    return text?.trim().length > 0;
  }

  defaultMessage(args: ValidationArguments): string {
    return "Body 'content' did not pass validator: content must not be empty";
  }
}