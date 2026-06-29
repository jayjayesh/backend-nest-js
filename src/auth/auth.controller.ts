import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign-in operation with email and password' })
  @Post('sign-in')
  signIn(@Body() body: AuthDto) {
    // console.log(body);
    return this.authService.signIn(body);
  }

  @ApiOperation({ summary: 'Register new user' })
  @Post('sign-up')
  signUp(@Body() body: AuthDto) {
    return this.authService.signUp(body);
  }
}
