import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  signIn(body: AuthDto) {
    return {
      email: body.email,
      password: body.password,
    };
  }

  async signUp(body: AuthDto) {
    const hash = await argon.hash(body.password);
    const user = await this.prisma.user.create({
      data: {
        email: body.email,
        password: hash,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }
}
