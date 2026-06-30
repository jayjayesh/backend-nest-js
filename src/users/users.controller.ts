import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { UsersService } from './users.service';
import { EditUserDto } from './dto';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SwaggerUserResponseDto } from './dto/swagger-user-response.dto';

@ApiTags('Users')
@ApiBearerAuth() // it show lock icon
@ApiUnauthorizedResponse({ description: '401 : invalid JWT' })
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}
  ///
  @ApiOperation({ summary: 'Get current user' })
  @ApiOkResponse({
    description: 'Get current user successfully',
    type: SwaggerUserResponseDto,
  })
  @Get('me')
  getMe(@GetUser() user: { userId: string; email: string }) {
    return user;
  }

  @ApiOperation({ summary: 'Update current user' })
  @ApiOkResponse({
    description: 'Update current user successfully',
    type: SwaggerUserResponseDto,
  })
  @Patch()
  editUser(@GetUser('userId') userId: string, @Body() body: EditUserDto) {
    // console.log('UsersController : editUser called with:', { userId, body });
    return this.userService.editUser(userId, body);
  }
}
