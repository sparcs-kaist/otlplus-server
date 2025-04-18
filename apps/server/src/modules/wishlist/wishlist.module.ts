import { Module } from '@nestjs/common';
import { PrismaModule } from '@otl/prisma-client/prisma.module';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';

@Module({
  imports: [PrismaModule],
  controllers: [WishlistController],
  providers: [WishlistService],
})
export class WishlistModule {}
