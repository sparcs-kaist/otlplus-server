import { Controller } from '@nestjs/common'
import { FieldService } from '@otl/lab-server/modules/field/field.service'

@Controller('api/field')
export class FieldController {
  constructor(private readonly fieldService: FieldService) {}
}
