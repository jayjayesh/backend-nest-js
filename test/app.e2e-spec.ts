import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto';
import { emit, title } from 'node:process';
import { EditUserDto } from '../src/users/dto';
import { CreateBookmarkDto, EditBookmarkDto } from '../src/bookmarks/dto';

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

    describe('Signup', () => {
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

    describe('Signin', () => {
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
          .stores('userAt', 'data.access_token');
      });
    });
  });

  ///
  describe('User', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });
    });
    describe('Edit user', () => {
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
    ///
    describe('Get empty bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLike({ data: [] });
      });
    });

    ///
    describe('Create bookmark', () => {
      const createBookmarkDto: CreateBookmarkDto = {
        title: 'First BookMark',
        description: 'first bookmark description',
        link: 'https://www.google.com',
      };

      it('should throw if title is empty', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody({
            description: createBookmarkDto.description,
            link: createBookmarkDto.link,
          })
          .expectStatus(400);
      });

      it('should throw if link is empty', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody({
            title: createBookmarkDto.title,
            description: createBookmarkDto.description,
          })
          .expectStatus(400).inspect();
      });

      it('should create bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(createBookmarkDto)
          .expectStatus(201)
          .stores('freshCreatedBookmarkId', 'data.id');
      });
    });

    ///
    describe('Get bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength('data', 1);
      });
    });
    ///
    describe('Get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{freshCreatedBookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{freshCreatedBookmarkId}');
      });
    });
    ///
    describe('Edit bookmark by id', () => {
      const editBookmarkDto: EditBookmarkDto = {
        title: 'First BookMark Edited',
      };
      it('should edit bookmark', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{freshCreatedBookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(editBookmarkDto)
          .expectStatus(200)
          .expectBodyContains(editBookmarkDto.title);
      });
    });
    ///
    describe('Delete bookmark by id', () => {
      it('should delete bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{freshCreatedBookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });

      it('should get empty bookmark', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength('data', 0);
      });
    });
  });
});
