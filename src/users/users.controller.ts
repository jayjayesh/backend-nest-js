import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { UsersService } from './users.service';
import { EditUserDto } from './dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) { }
  ///
  @Get('me')
  getMe(@GetUser() user: { userId: string; email: string }) {
    return user;
  }

  @Patch()
  editUser(@GetUser('id') userId: string, @Body() body: EditUserDto) {
    return this.userService.editUser(userId, body);
  }
}
