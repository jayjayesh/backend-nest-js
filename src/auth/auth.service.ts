import { Body, Injectable } from '@nestjs/common';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  signIn(body: AuthDto) {
    return {
      email: body.email,
      password: body.password,
    };
  }

  signUp(body: AuthDto) {
    return {
      email: body.email,
      password: body.password,
    };
  }
}
