import { AgreementInPrivatePort } from '@otl/server-nest/modules/agreement/domain/agreement.in.private.port'
import { AgreementInPublicPort } from '@otl/server-nest/modules/agreement/domain/agreement.in.public.port'

export const AGREEMENT_IN_PORT = Symbol('AgreementInPort')
export const AGREEMENT_IN_PRIVATE_PORT = Symbol('AgreementInPrivatePort')
export const AGREEMENT_IN_PUBLIC_PORT = Symbol('AgreementInPublicPort')
export interface AgreementInPort extends AgreementInPrivatePort, AgreementInPublicPort {}
