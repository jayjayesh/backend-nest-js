import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, RefreshDto } from './dto';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign-in operation with email and password' })
  @ApiOkResponse({
    description: 'Signed in successfully, returns access token',
  })
  @ApiBadRequestResponse({ description: '400 : validation failed' })
  @ApiForbiddenResponse({ description: '403 : Not allowed, wrong credentials' })
  @Post('sign-in')
  signIn(@Body() body: AuthDto) {
    // console.log(body);
    return this.authService.signIn(body);
  }

  @ApiOperation({ summary: 'Register new user' })
  @ApiCreatedResponse({ description: 'User registered, returns access token' })
  @ApiBadRequestResponse({ description: '400 : Validation failed' })
  @ApiConflictResponse({ description: '409 : Email is already taken' })
  @Post('sign-up')
  signUp(@Body() body: AuthDto) {
    return this.authService.signUp(body);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a new access token using a refresh token' })
  @ApiOkResponse({ description: 'Returns a new access + refresh token pair' })
  @ApiBadRequestResponse({ description: '400 : validation failed' })
  @ApiForbiddenResponse({
    description: '403 : invalid or expired refresh token',
  })
  @Post('refresh-token')
  refreshToken(@Body() body: RefreshDto) {
    return this.authService.refreshToken(body.refresh_token);
  }
}
