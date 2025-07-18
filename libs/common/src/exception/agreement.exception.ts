import { OtlException } from '@otl/common/exception/otl.exception'

export class AgreementException extends OtlException {
  static readonly DEFAULT_MESSAGE = 'Agreement Exception'

  static readonly DOES_NOT_EXIST_MESSAGE = 'Agreement for that use does not exist'

  public readonly code: number

  constructor(code: number, message: string, callee?: string) {
    super(code, message, callee)
    this.name = 'UserException'
    this.code = code
    if (!message) {
      this.message = AgreementException.DEFAULT_MESSAGE
    }
  }
}
