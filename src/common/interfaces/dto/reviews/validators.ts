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
