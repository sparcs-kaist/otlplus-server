import { AgreementInPrivatePort } from '@otl/server-nest/modules/agreement/domain/agreement.in.private.port'
import { AgreementInPublicPort } from '@otl/server-nest/modules/agreement/domain/agreement.in.public.port'

export const AgreementInPortSymbol = Symbol('AgreementInPort')
export const AgreementInPrivatePortSymbol = Symbol('AgreementInPrivatePort')
export const AgreementInPublicPortSymbol = Symbol('AgreementInPublicPort')
export interface AgreementInPort extends AgreementInPrivatePort, AgreementInPublicPort {}
