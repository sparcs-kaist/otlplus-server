import { OtlException } from '@otl/common/exception/otl.exception'

export class SyncException extends OtlException {
  static readonly DEFAULT_MESSAGE = 'Sync Exception'

  static readonly DUPLICATE_TAKEN_LECTURE_SYNC_REQUEST = 'Duplicate taken lecture sync request'

  public readonly code: number

  constructor(code: number, message: string, callee?: string) {
    super(code, message, callee)
    this.name = 'SyncException'
    this.code = code
    if (!message) {
      this.message = SyncException.DEFAULT_MESSAGE
    }
  }
}
