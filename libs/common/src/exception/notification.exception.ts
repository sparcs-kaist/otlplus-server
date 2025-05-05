import { OtlException } from '@otl/common/exception/otl.exception'

export class NotificationException extends OtlException {
  static readonly DEFAULT_MESSAGE = 'Notification Exception'

  static readonly METADATA_INSUFFICIENT = 'METADATA_INSUFFICIENT'

  public readonly code: number

  constructor(code: number, message?: string, callee?: string) {
    super(code, message, callee)
    this.name = 'UserException'
    this.code = code
    if (!message) {
      this.message = NotificationException.DEFAULT_MESSAGE
    }
  }
}
