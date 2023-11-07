import { Module } from '@nestjs/common';
import { ShareController } from './share.controller';
import { ShareService } from './share.service';

@Module({
  controllers: [ShareController],
  providers: [ShareService],
})
export class ShareModule {}
