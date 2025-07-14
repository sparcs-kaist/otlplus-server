import { Controller, Get, Query } from '@nestjs/common'

@Controller('api/lab')
export class LabController {
  // TODO: implement lab API below
  @Get('/autocomplete')
  autocomplete(@Query('prefix') prefix: string) {
    return `/api/lab/autocomplete?prefix=${prefix}`
  }
}
