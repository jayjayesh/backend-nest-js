import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  signIn(@Body() body: AuthDto) {
    // console.log(body);
    return this.authService.signIn(body);
  }

  @Post('sign-up')
  signUp(@Body() body: AuthDto) {
    return this.authService.signUp(body);
  }
}
