import { HttpException } from '@nestjs/common'
import { getReasonPhrase, StatusCodes } from 'http-status-codes'

export class OtlException extends HttpException {
  public readonly code: number

  public readonly callee: string

  constructor(code: number, message: string, callee?: string) {
    super(message, code)
    this.name = 'OtlException'
    this.code = code
    this.callee = callee || 'Unknown'
  }
}

export class NotImplementedAPIException extends OtlException {
  private readonly DEFAULT_MESSAGE: string = 'Not Implemented API Exception'

  constructor(callee?: string) {
    super(StatusCodes.NOT_IMPLEMENTED, getReasonPhrase(StatusCodes.NOT_IMPLEMENTED), callee)
  }
}
