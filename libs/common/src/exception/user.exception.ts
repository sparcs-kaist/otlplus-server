import { OtlException } from '@otl/common/exception/otl.exception'

export class UserException extends OtlException {
  static readonly DEFAULT_MESSAGE = 'User Exception'

  static readonly DEVICE_NOT_FOUND = 'Device not found'

  static readonly DEVICE_FORBIDDEN = 'Device forbidden'

  static readonly DEVICE_DUPLICATE = 'Device duplicate'

  public readonly code: number

  constructor(code: number, message: string, callee?: string) {
    super(code, message, callee)
    this.name = 'UserException'
    this.code = code
    if (!message) {
      this.message = UserException.DEFAULT_MESSAGE
    }
  }
}
