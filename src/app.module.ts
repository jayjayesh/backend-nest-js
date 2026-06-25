import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { PrismaModule } from './prisma/prisma.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

// Decorator
@Module({
  imports: [AuthModule, UsersModule, BookmarksModule, PrismaModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule { }
