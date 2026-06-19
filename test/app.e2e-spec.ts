import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  /// This is starting logic
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
  });

  /// This is teardown logic
  afterAll(async () => {
    await app.close();
  });

  ///================
  it.todo('Hello World');
  // it.todo('Hello World-2');
  ///================

  ///
  describe('Auth', () => {
    describe('signUp', () => {});
    describe('signIn', () => {});
  });

  ///
  describe('User', () => {
    describe('getMe', () => {});
    describe('editUser', () => {});
  });

  ///
  describe('Bookmarks', () => {
    describe('getBookmarks', () => {});
    describe('getBookmarkById', () => {});
    describe('createBookmark', () => {});
    describe('editBookmarkById', () => {});
    describe('deleteBookmarkById', () => {});
  });
});
