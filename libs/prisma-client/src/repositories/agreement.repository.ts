import { Injectable } from '@nestjs/common'
import { AgreementRepository } from '@otl/server-nest/modules/agreement/domain/agreement.repository'
import { Agreement, UserAgreement, UserAgreementCreate } from '@otl/server-nest/modules/agreement/domain/UserAgreement'

import { AgreementType } from '@otl/common/enum/agreement'
import { OtlException } from '@otl/common/exception/otl.exception'

import { mapUserAgreement } from '@otl/prisma-client/common/mapper/agreement'
import { EAgreement } from '@otl/prisma-client/entities/EAgreement'
import { PrismaService } from '@otl/prisma-client/prisma.service'

@Injectable()
export class AgreementPrismaRepository implements AgreementRepository {
  constructor(private readonly prisma: PrismaService) {}

  async delete(agreement: UserAgreement): Promise<UserAgreement> {
    const { id } = agreement
    const target: EAgreement.UserAgreement = await this.prisma.session_userprofile_agreement.findUniqueOrThrow({
      where: {
        id,
      },
      include: EAgreement.UserAgreement.include,
    })
    if (target == null) {
      throw new OtlException(404, 'User with that Agreement not found')
    }
    else {
      await this.prisma.agreement.delete({
        where: {
          id,
        },
      })
      return mapUserAgreement(target)
    }
  }

  async deleteMany(agreements: UserAgreement[]): Promise<UserAgreement[]> {
    const ids = agreements.map((e) => e.id)
    const targets: EAgreement.UserAgreement[] = await this.prisma.session_userprofile_agreement.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      include: EAgreement.UserAgreement.include,
    })
    await this.prisma.agreement.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    })
    return targets.map((e) => mapUserAgreement(e))
  }

  findById(id: number): Promise<UserAgreement | null> {
    return this.prisma.session_userprofile_agreement
      .findUniqueOrThrow({
        where: {
          id,
        },
        include: EAgreement.UserAgreement.include,
      })
      .then((e) => {
        if (e == null) {
          return null
        }

        return mapUserAgreement(e)
      })
  }

  findByUserId(userId: number): Promise<UserAgreement[] | null> {
    return this.prisma.session_userprofile_agreement
      .findMany({
        where: {
          userprofile_id: userId,
        },
        include: EAgreement.UserAgreement.include,
      })
      .then((e) => {
        if (e == null) {
          return null
        }
        return e.map((ee) => mapUserAgreement(ee))
      })
  }

  async findByUserIdAndType(userId: number, type: AgreementType): Promise<UserAgreement | null> {
    const agreementType = await this.prisma.agreement.findUniqueOrThrow({
      where: {
        name: type,
      },
    })
    return this.prisma.session_userprofile_agreement
      .findUnique({
        where: {
          userprofile_id_agreement_id: {
            userprofile_id: userId,
            agreement_id: agreementType.id,
          },
        },
        include: EAgreement.UserAgreement.include,
      })
      .then((e) => {
        if (e == null) {
          return null
        }
        return mapUserAgreement(e)
      })
  }

  async getAllAgreementTypes(): Promise<Agreement[]> {
    return await this.prisma.agreement
      .findMany({
        select: {
          id: true,
          name: true,
        },
      })
      .then((e) => {
        if (e == null) {
          throw new OtlException(404, 'Agreement not found')
        }
        return e.map((ee) => ({
          id: ee.id,
          agreementType: ee.name,
        }))
      })
  }

  async insert(agreement: UserAgreementCreate): Promise<UserAgreement> {
    const { userId, agreementType } = agreement
    const agreementTypeId = await this.prisma.agreement.findUniqueOrThrow({
      where: {
        name: agreementType,
      },
    })
    const userAgreement = await this.prisma.session_userprofile_agreement.create({
      data: {
        userprofile_id: userId,
        agreement_id: agreementTypeId.id,
      },
      include: EAgreement.UserAgreement.include,
    })
    return mapUserAgreement(userAgreement)
  }

  async insertMany(agreement: UserAgreementCreate[]): Promise<UserAgreement[]> {
    const allAgreementTypes = await this.getAllAgreementTypes()
    const allAgreementTypesMap = new Map<string, number>()
    allAgreementTypes.forEach((e) => {
      allAgreementTypesMap.set(e.agreementType, e.id)
    })
    const agreementCreate = agreement.map((e) => {
      const agreementTypeId = allAgreementTypesMap.get(e.agreementType)
      if (agreementTypeId == null) {
        throw new OtlException(404, 'Agreement not found')
      }
      return {
        userId: e.userId,
        agreementId: agreementTypeId,
      }
    })
    await this.prisma.session_userprofile_agreement.createMany({
      data: agreementCreate.map((e) => ({
        userprofile_id: e.userId,
        agreement_id: e.agreementId,
      })),
    })
    const userAgreements = await this.prisma.session_userprofile_agreement.findMany({
      where: {
        userprofile_id: {
          in: agreementCreate.map((e) => e.userId),
        },
      },
      include: EAgreement.UserAgreement.include,
    })
    return userAgreements.map((e) => mapUserAgreement(e))
  }

  update(agreement: UserAgreement): Promise<UserAgreement> {
    return this.prisma.session_userprofile_agreement
      .update({
        where: {
          id: agreement.id,
        },
        data: {
          agreement_status: agreement.agreementStatus,
          need_to_show: agreement.modal,
        },
        include: EAgreement.UserAgreement.include,
      })
      .then((e) => mapUserAgreement(e))
  }

  async updateMany(agreement: UserAgreement[]): Promise<UserAgreement[]> {
    await Promise.all(agreement.map((a) => this.update(a)))
    const userAgreements = await this.prisma.session_userprofile_agreement.findMany({
      where: {
        id: {
          in: agreement.map((e) => e.id),
        },
      },
      include: EAgreement.UserAgreement.include,
    })
    return userAgreements.map((e) => mapUserAgreement(e))
  }

  async upsert(agreement: UserAgreementCreate): Promise<UserAgreement> {
    const { userId, agreementType } = agreement
    const allAgreementTypes = await this.getAllAgreementTypes()
    const allAgreementTypesMap = new Map<string, number>()
    allAgreementTypes.forEach((e) => {
      allAgreementTypesMap.set(e.agreementType, e.id)
    })
    const agreementTypeId = allAgreementTypesMap.get(agreementType)
    if (agreementTypeId == null) {
      throw new OtlException(404, 'Agreement not found')
    }
    return this.prisma.session_userprofile_agreement
      .upsert({
        where: {
          userprofile_id_agreement_id: {
            userprofile_id: userId,
            agreement_id: agreementTypeId,
          },
        },
        create: {
          userprofile_id: userId,
          agreement_id: agreementTypeId,
          agreement_status: agreement.agreementStatus,
          need_to_show: agreement.modal,
        },
        update: {
          agreement_status: agreement.agreementStatus,
          need_to_show: agreement.modal,
        },
        include: EAgreement.UserAgreement.include,
      })
      .then((e) => mapUserAgreement(e))
  }

  async upsertMany(agreement: UserAgreement[]): Promise<UserAgreement[]> {
    const allAgreementTypes = await this.getAllAgreementTypes()
    const allAgreementTypesMap = new Map<string, number>()
    allAgreementTypes.forEach((e) => {
      allAgreementTypesMap.set(e.agreementType, e.id)
    })

    const agreementCreate = agreement.map((e) => {
      const agreementTypeId = allAgreementTypesMap.get(e.agreementType)
      if (agreementTypeId == null) {
        throw new OtlException(404, 'Agreement not found')
      }
      return {
        ...e,
        agreementId: agreementTypeId,
      }
    })
    const upsertUserAgreements = await Promise.all(
      agreementCreate.map((e) => this.prisma.session_userprofile_agreement.upsert({
        where: {
          userprofile_id_agreement_id: {
            userprofile_id: e.userId,
            agreement_id: e.agreementId,
          },
        },
        create: {
          userprofile_id: e.userId,
          agreement_id: e.agreementId,
          agreement_status: e.agreementStatus,
          need_to_show: e.modal,
        },
        update: {
          agreement_status: e.agreementStatus,
          need_to_show: e.modal,
        },
        include: EAgreement.UserAgreement.include,
      })),
    )
    return upsertUserAgreements.map((e) => mapUserAgreement(e))
  }
}
