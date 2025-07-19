import { Agreement, UserAgreement } from '@otl/server-nest/modules/agreement/domain/UserAgreement'

import { EAgreement } from '@otl/prisma-client/entities/EAgreement'

export function mapUserAgreement(userAgreement: EAgreement.UserAgreement): UserAgreement {
  return {
    id: userAgreement.id,
    agreementId: userAgreement.agreement_id,
    userId: userAgreement.userprofile_id,
    agreementType: userAgreement.agreement.name,
    agreementStatus: userAgreement.agreement_status,
    modal: userAgreement.need_to_show,
  }
}

export function mapAgreement(agreement: EAgreement.Basic): Agreement {
  return {
    id: agreement.id,
    agreementType: agreement.name,
  }
}
