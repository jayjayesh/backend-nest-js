import { Module, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard';
import { BookmarksController } from './bookmarks.controller';
import { BookmarksService } from './bookmarks.service';

@Module({
  controllers: [BookmarksController],
  providers: [BookmarksService],
})
export class BookmarksModule {}
