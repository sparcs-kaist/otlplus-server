import { Module } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { PrismaModule } from '@otl/prisma-client/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [DepartmentsService],
  exports: [DepartmentsService],
})
export class DepartmentsModule {}
