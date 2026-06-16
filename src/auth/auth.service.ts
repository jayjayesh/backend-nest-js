import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async signIn(body: AuthDto) {
    ///
    const userObjc = await this.prisma.user.findUnique({
      where: { email: body.email },
    });
    if (!userObjc) {
      throw new ForbiddenException('Credentials incorrect');
    }

    ///
    const pwMatch = await argon.verify(userObjc.password, body.password);
    if (!pwMatch) {
      throw new ForbiddenException('Credentials incorrect Password');
    }

    ///
    const safeUser = await this.prisma.user.findUnique({
      where: { email: body.email },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return safeUser;
  }

  async signUp(body: AuthDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: body.email },
    });
    if (existingUser) {
      throw new ConflictException('Email is already taken');
    }

    const hash = await argon.hash(body.password);
    const userObjc = await this.prisma.user.create({
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

    return userObjc;
  }
}
