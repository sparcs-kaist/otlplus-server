import { Controller } from '@nestjs/common'

import { PersonalsService } from './personals.service'

@Controller('api/personals')
export class PersonalsController {
  constructor(private readonly personalsService: PersonalsService) {}
}
