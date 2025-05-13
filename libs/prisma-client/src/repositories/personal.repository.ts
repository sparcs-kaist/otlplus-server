import { Injectable } from '@nestjs/common'
import { personal_block, Prisma } from '@prisma/client'

import { PrismaService } from '../prisma.service'

type PersonalUpdateInput = {
  id: number
  title: string
  place: string
  description: string
  color: number
}

@Injectable()
export class PersonalsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createPersonal(personal: Prisma.personal_blockCreateInput): Promise<personal_block> {
    const createdPersonal = await this.prisma.personal_block.create({
      data: {
        ...personal,
      },
    })
    return createdPersonal
  }

  async updatePersonal(personal: PersonalUpdateInput): Promise<personal_block> {
    const updatedPersonal = await this.prisma.personal_block.update({
      where: { id: personal.id },
      data: {
        ...personal,
      },
    })
    return updatedPersonal
  }

  async deletePersonal(id: number): Promise<personal_block> {
    const deletedPersonal = await this.prisma.personal_block.delete({
      where: { id },
    })
    return deletedPersonal
  }
}
