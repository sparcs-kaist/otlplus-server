import { Module } from '@nestjs/common';
import { WishlistController } from './wishlist.controller';

@Module({
  controllers: [WishlistController],
})
export class WishlistModule {}
