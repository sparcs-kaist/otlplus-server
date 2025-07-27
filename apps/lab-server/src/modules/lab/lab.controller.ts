import { Controller } from '@nestjs/common'
import { LabService } from '@otl/lab-server/modules/lab/lab.service'

@Controller('api/lab')
export class LabController {
  constructor(private readonly labService: LabService) {}
}
