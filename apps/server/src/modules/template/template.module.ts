import { Module } from '@nestjs/common';
import { TemplateController } from './template.controller';
import { TemplateService } from './template.service';

@Module({
  controllers: [TemplateController],
  providers: [TemplateService],
})
export class TemplateModule {}
