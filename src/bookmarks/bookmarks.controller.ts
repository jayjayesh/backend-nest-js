import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard';
import { BookmarksService } from './bookmarks.service';
import { GetUser } from '../auth/decorator';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@UseGuards(JwtAuthGuard)
@Controller('bookmarks')
export class BookmarksController {
  constructor(private bookmarksService: BookmarksService) { }

  @Get()
  getBookmarks(@GetUser('id') userId: string) {
    return this.bookmarksService.getBookmarks(userId);
  }

  @Get(':id')
  getBookmarkById(
    @GetUser('id') userId: string,
    @Param('id') bookmarkId: string,
  ) {
    return this.bookmarksService.getBookmarkById(userId, bookmarkId);
  }

  @Post()
  createBookmark(
    @GetUser('id') userId: string,
    @Body() body: CreateBookmarkDto,
  ) {
    return this.bookmarksService.createBookmark(userId, body);
  }

  @Patch(':id')
  editBookmarkById(
    @GetUser('id') userId: string,
    @Param('id') bookmarkId: string,
    @Body() body: EditBookmarkDto,
  ) {
    return this.bookmarksService.editBookmarkById(userId, bookmarkId, body);
  }

  @Delete(':id')
  deleteBookmarkById(
    @GetUser('id') userId: string,
    @Param('id') bookmarkId: string,
  ) {
    return this.bookmarksService.deleteBookmarkById(userId, bookmarkId);
  }
}
