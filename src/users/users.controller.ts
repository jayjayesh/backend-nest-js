import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { UsersService } from './users.service';
import { EditUserDto } from './dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}
  ///
  @ApiOperation({ summary: 'Get current user' })
  @Get('me')
  getMe(@GetUser() user: { userId: string; email: string }) {
    return user;
  }

  @ApiOperation({ summary: 'Update current user' })
  @Patch()
  editUser(@GetUser('userId') userId: string, @Body() body: EditUserDto) {
    // console.log('UsersController : editUser called with:', { userId, body });
    return this.userService.editUser(userId, body);
  }
}
