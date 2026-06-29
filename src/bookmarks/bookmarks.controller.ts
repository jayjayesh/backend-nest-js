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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Bookmarks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bookmarks')
export class BookmarksController {
  constructor(private bookmarksService: BookmarksService) {}

  @ApiOperation({ summary: 'Get all bookmarks for current login user' })
  @Get()
  getBookmarks(@GetUser('userId') userId: string) {
    return this.bookmarksService.getBookmarks(userId);
  }

  @ApiOperation({
    summary: 'Get particular bookmark by providing bookmark id',
  })
  @Get(':id')
  getBookmarkById(
    @GetUser('userId') userId: string,
    @Param('id') bookmarkId: string,
  ) {
    return this.bookmarksService.getBookmarkById(userId, bookmarkId);
  }

  @ApiOperation({ summary: 'Create new bookmark' })
  @Post()
  createBookmark(
    @GetUser('userId') userId: string,
    @Body() body: CreateBookmarkDto,
  ) {
    return this.bookmarksService.createBookmark(userId, body);
  }

  @ApiOperation({ summary: 'Edit particular bookmark' })
  @Patch(':id')
  editBookmarkById(
    @GetUser('userId') userId: string,
    @Param('id') bookmarkId: string,
    @Body() body: EditBookmarkDto,
  ) {
    return this.bookmarksService.editBookmarkById(userId, bookmarkId, body);
  }

  @ApiOperation({ summary: 'Delete particular bookmark' })
  @Delete(':id')
  deleteBookmarkById(
    @GetUser('userId') userId: string,
    @Param('id') bookmarkId: string,
  ) {
    return this.bookmarksService.deleteBookmarkById(userId, bookmarkId);
  }
}
