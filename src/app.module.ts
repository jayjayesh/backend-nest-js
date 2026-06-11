import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';

// Decorator
@Module({
  imports: [AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
