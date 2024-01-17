import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DepartmentsModule } from '../departments/departments.module';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';

@Module({
  imports: [PrismaModule, DepartmentsModule],
  controllers: [SessionController],
  providers: [SessionService],
})
export class SessionModule {}