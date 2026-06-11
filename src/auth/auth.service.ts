import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  signIn(email: string, password: string) {
    return {
      email,
      password,
    };
  }

  signUp(email: string, password: string) {
    return {
      email,
      password,
    };
  }
}
