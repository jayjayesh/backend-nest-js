import { ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

export class BookmarksService {
  constructor(private prisma: PrismaService) {}

  async getBookmarks(userId: string) {
    return await this.prisma.bookmark.findMany({
      where: { userId },
    });
  }

  async getBookmarkById(userId: string, bookmarkId: string) {
    return await this.prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId,
      },
    });
  }

  async createBookmark(userId: string, body: CreateBookmarkDto) {
    const bookmarkObj = await this.prisma.bookmark.create({
      data: {
        userId,
        ...body,
      },
    });

    return bookmarkObj;
  }

  async editBookmarkById(
    userId: string,
    bookmarkId: string,
    body: EditBookmarkDto,
  ) {
    const bookmark = await this.prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
      },
    });

    if (!bookmark || bookmark.userId != userId) {
      throw new ForbiddenException('Access to resources denied');
    }

    return this.prisma.bookmark.update({
      where: {
        id: bookmarkId,
      },
      data: {
        ...body,
      },
    });
  }

  async deleteBookmarkById(userId: string, bookmarkId: string) {
    const bookmark = await this.prisma.bookmark.findFirst({
      where: { id: bookmarkId },
    });

    if (!bookmark || bookmark.userId != userId) {
      throw new ForbiddenException('Access to resources denied');
    }

    return await this.prisma.bookmark.delete({
      where: {
        id: bookmarkId,
      },
    });
  }
}
