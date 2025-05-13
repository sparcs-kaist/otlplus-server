import {
  Body, Controller, Delete, Param, Patch, Post,
} from '@nestjs/common'
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator'
import { IPersonal } from '@otl/server-nest/common/interfaces'
import { session_userprofile } from '@prisma/client'

import { PersonalsService } from './personals.service'

@Controller('api/personals')
export class PersonalsController {
  constructor(private readonly personalsService: PersonalsService) {}

  @Post()
  async createPersonal(@Body() personal: IPersonal.CreateDto, @GetUser() user: session_userprofile) {
    return this.personalsService.createPersonal(user, personal)
  }

  @Patch(':id')
  async updatePersonal(
    @Param('personalId') personalId: string,
    @Body() personal: IPersonal.UpdateDto,
    @GetUser() user: session_userprofile,
  ) {
    return this.personalsService.patchPersonal(user, parseInt(personalId), personal)
  }

  @Delete(':id')
  async deletePersonal(@Param('personalId') personalId: string, @GetUser() user: session_userprofile) {
    return this.personalsService.deletePersonal(user, parseInt(personalId))
  }
}
