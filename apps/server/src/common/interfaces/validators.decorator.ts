import {
  registerDecorator,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import Cron from 'cron-validator'

// TODO: Django specific한 구현이었던 것 아닐까 의심됨. prisma에 맞게 수정 필요
export const PROHIBITED_FIELD_PATTERN: RegExp[] = [/user/, /profile/, /owner/, /writer/, /__.*__/, /\?/]

export function RegexValidator(regexExps: RegExp[], validationOptions?: { message?: string }) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'regexValidator',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: regexExps,
      validator: {
        validate(order: string[], _args: ValidationArguments): boolean {
          return order.every((o) => regexExps.every((p) => p.test(o)))
        },

        defaultMessage(_validationArguments?: ValidationArguments): string {
          return 'Only alphanumeric characters are allowed'
        },
      },
    })
  }
}

export function InverseRegexValidator(regexExps: RegExp[], validationOptions?: { message?: string }) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'regexValidator',
      target: object.constructor,
      propertyName,
      constraints: regexExps,
      options: validationOptions,
      validator: {
        validate(order: string[], _args: ValidationArguments): boolean {
          return order.every((o) => regexExps.every((p) => !p.test(o)))
        },

        defaultMessage(_validationArguments?: ValidationArguments): string {
          return 'Only alphanumeric characters are allowed'
        },
      },
    })
  }
}

export function CronValidator(validationOptions?: { message?: string }) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'CronValidator',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: string, _args: ValidationArguments): boolean {
          return Cron.isValidCron(value, { seconds: true })
        },
        defaultMessage(_validationArguments?: ValidationArguments): string {
          return 'Invalid cron expression'
        },
      },
    })
  }
}

export function OrderDefaultValidator(regexExps: RegExp[], validationOptions?: { message?: string }) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'OrderDefaultValidator',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: regexExps,
      validator: {
        validate(order: string[], _args: ValidationArguments): boolean {
          return order.every((o) => regexExps.every((p) => !p.test(o)))
        },
        defaultMessage(_validationArguments?: ValidationArguments): string {
          return 'Only alphanumeric characters are allowed'
        },
      },
    })
  }
}

@ValidatorConstraint({ name: 'STRING_STRIP_LENGTH', async: false })
export class StringStripLength implements ValidatorConstraintInterface {
  validate(text: string): boolean {
    return text?.trim().length > 0
  }

  defaultMessage(_args: ValidationArguments): string {
    return 'Body \'content\' did not pass validator: content must not be empty'
  }
}
