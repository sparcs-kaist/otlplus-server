import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

const PROHIBITED_FIELD_PATTERN: RegExp[] = [
  /\?/,
  /user/,
  /profile/,
  /owner/,
  /writer/,
  /__.*__/,
];

@ValidatorConstraint({ name: 'ORDER_DEFAULT_VALIDATOR', async: false })
export class OrderDefaultValidator implements ValidatorConstraintInterface {
  validate(order: string[]): boolean {
    return order.every((o) => {
      return PROHIBITED_FIELD_PATTERN.every((p) => !p.test(o));
    });
  }

  defaultMessage(args: ValidationArguments): string {
    return 'Body ' + args + ' did not pass validator';
  }
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