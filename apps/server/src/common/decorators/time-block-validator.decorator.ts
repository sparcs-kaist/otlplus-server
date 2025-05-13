import { registerDecorator } from 'class-validator'

import { WeekdayEnum } from '@otl/common/enum/time'

export const IsTimeBlockDay = () => (object: object, propertyName: string) => {
  registerDecorator({
    name: 'isTimeBlockDay',
    target: object.constructor,
    propertyName,
    validator: {
      validate(value: any) {
        return value instanceof Date || Object.values(WeekdayEnum).includes(value)
      },
      defaultMessage() {
        return 'day must be either a Date or WeekdayEnum'
      },
    },
  })
}

export const IsTimeBlock = () => (object: object, propertyName: string) => {
  registerDecorator({
    name: 'isTimeBlock',
    target: object.constructor,
    propertyName,
    validator: {
      validate(value: any) {
        return (
          typeof value === 'object' && (value.day instanceof Date || Object.values(WeekdayEnum).includes(value.day))
        )
      },
      defaultMessage() {
        return 'timeBlock must be a TimeBlock'
      },
    },
  })
}
