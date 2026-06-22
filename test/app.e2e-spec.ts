import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto';
import { emit } from 'node:process';
import { EditUserDto } from '../src/users/dto';

describe('App (e2e)', () => {
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
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  /// This is teardown logic
  afterAll(async () => {
    await app.close();
  });

  ///================
  // it.todo('Hello World');
  // it.todo('Hello World-2');
  ///================

  ///
  describe('Auth', () => {
    const body: AuthDto = {
      email: 'valid@email.com',
      password: '123',
    };

    describe('sign-up', () => {
      it('should throw if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/sign-up')
          .withBody({
            password: body.password,
          })
          .expectStatus(400);
      });

      it('should throw if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/sign-up')
          .withBody({
            email: body.email,
          })
          .expectStatus(400);
      });

      it('should throw if body is empty', () => {
        return pactum.spec().post('/auth/sign-up').expectStatus(400);
      });

      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/sign-up')
          .withBody(body)
          .expectStatus(201);
      });
    });

    describe('sign-in', () => {
      it('should throw if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/sign-in')
          .withBody({
            password: body.password,
          })
          .expectStatus(400);
      });

      it('should throw if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/sign-in')
          .withBody({
            email: body.email,
          })
          .expectStatus(400);
      });

      it('should throw if body is empty', () => {
        return pactum.spec().post('/auth/sign-in').expectStatus(400);
      });
      it('should signin', () => {
        return pactum
          .spec()
          .post('/auth/sign-in')
          .withBody(body)
          .expectStatus(200)
          .inspect()
          .stores('userAt', 'access_token');
      });
    });
  });

  ///
  describe('User', () => {
    describe('get current user', () => {
      it('should get me', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });
    });
    describe('editUser', () => {
      const bodyDto: EditUserDto = {
        firstName: 'validUser edited',
        lastName: 'test',
      };

      it('should edit user', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(bodyDto)
          .expectStatus(200)
          .expectBodyContains(bodyDto.firstName)
          .expectBodyContains(bodyDto.lastName);
      });
    });
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
