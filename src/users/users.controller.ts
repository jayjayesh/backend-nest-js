import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  ///
  ///
  @Get('me')
  getMe(@GetUser() user: { userId: string; email: string }) {
    return user;
  }
}
