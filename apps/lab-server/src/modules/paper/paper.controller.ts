import { Controller } from '@nestjs/common'
import { PaperService } from '@otl/lab-server/modules/paper/paper.service'

@Controller('api/paper')
export class PaperController {
  constructor(private readonly paperService: PaperService) {}
}
