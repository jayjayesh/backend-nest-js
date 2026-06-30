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
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SwaggerBookmarkResponseDto } from './dto/swagger-bookmark-response.dto';

@ApiTags('Bookmarks')
@ApiBearerAuth() // it show lock icon
@ApiUnauthorizedResponse({ description: '401 : invalid JWT' })
@UseGuards(JwtAuthGuard)
@Controller('bookmarks')
export class BookmarksController {
  constructor(private bookmarksService: BookmarksService) {}

  @ApiOperation({ summary: 'Get all bookmarks for current login user' })
  @ApiOkResponse({
    description: 'Get all bookmarks, return bookmark list',
    type: SwaggerBookmarkResponseDto,
    isArray: true,
  })
  @Get()
  getBookmarks(@GetUser('userId') userId: string) {
    return this.bookmarksService.getBookmarks(userId);
  }

  @ApiOperation({
    summary: 'Get particular bookmark by providing bookmark id',
  })
  @ApiOkResponse({
    description: 'Get bookmarks by id, return single bookmark object',
    type: SwaggerBookmarkResponseDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Bookmark id (uuid)',
    example: '7d6839fa-9a11-4bd9-9d3f-2b331ea9dabc',
  })
  @Get(':id')
  getBookmarkById(
    @GetUser('userId') userId: string,
    @Param('id') bookmarkId: string,
  ) {
    return this.bookmarksService.getBookmarkById(userId, bookmarkId);
  }

  @ApiOperation({ summary: 'Create new bookmark' })
  @ApiCreatedResponse({
    description: 'New bookmark created, return new bookmark object',
  })
  @Post()
  createBookmark(
    @GetUser('userId') userId: string,
    @Body() body: CreateBookmarkDto,
  ) {
    return this.bookmarksService.createBookmark(userId, body);
  }

  @ApiOperation({ summary: 'Edit particular bookmark' })
  @ApiOkResponse({
    description: 'Edit bookmark successfully, return edited bookmark object',
  })
  @ApiForbiddenResponse({ description: '403 : bookmark is not yours' })
  @ApiNotFoundResponse({ description: '404 : bookmark not found' })
  @ApiParam({
    name: 'id',
    description: 'Bookmark id (uuid)',
    example: '7d6839fa-9a11-4bd9-9d3f-2b331ea9dabc',
  })
  @Patch(':id')
  editBookmarkById(
    @GetUser('userId') userId: string,
    @Param('id') bookmarkId: string,
    @Body() body: EditBookmarkDto,
  ) {
    return this.bookmarksService.editBookmarkById(userId, bookmarkId, body);
  }

  @ApiOperation({ summary: 'Delete particular bookmark' })
  @ApiOkResponse({
    description:
      'Bookmark deleted successfully, return deleted bookmark object',
  })
  @ApiForbiddenResponse({ description: '403 : bookmark is not yours' })
  @ApiNotFoundResponse({ description: '404 : id does not exist' })
  @ApiParam({
    name: 'id',
    description: 'Bookmark id (uuid)',
    example: '7d6839fa-9a11-4bd9-9d3f-2b331ea9dabc',
  })
  @Delete(':id')
  deleteBookmarkById(
    @GetUser('userId') userId: string,
    @Param('id') bookmarkId: string,
  ) {
    return this.bookmarksService.deleteBookmarkById(userId, bookmarkId);
  }
}
