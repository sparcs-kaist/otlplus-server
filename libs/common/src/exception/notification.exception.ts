import { OtlException } from '@otl/common/exception/otl.exception'

export class NotificationException extends OtlException {
  static readonly DEFAULT_MESSAGE = 'Notification Exception'

  static readonly METADATA_INSUFFICIENT = 'METADATA_INSUFFICIENT'

  static readonly NO_NOTIFICATION_USER = 'NO_NOTIFICATION_USER'

  static readonly NO_NOTIFICATION = 'NO_NOTIFICATION'

  static readonly NO_NOTIFICATION_REQUEST = 'NO_NOTIFICATION_REQUEST'

  static readonly FORBIDDEN_NOTIFICATION = 'FORBIDDEN_NOTIFICATION'

  public readonly code: number

  constructor(code: number, message: string, callee?: string) {
    super(code, message, callee)
    this.name = 'UserException'
    this.code = code
    if (!message) {
      this.message = NotificationException.DEFAULT_MESSAGE
    }
  }
}
