import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  ///
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
    return this.signToken(userObjc.id, userObjc.email);
  }

  ///
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

    /// Option A: return user only (current behavior)
    // return userObjc;
    /// Option B: auto-login — return token too
    return this.signToken(userObjc.id, userObjc.email);
  }

  ///
  async signToken(userId: string, email: string) {
    const payload = { sub: userId, email };
    const access_token = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: Number(process.env.JWT_EXPIRES_IN),
    });
    const refresh_token = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: Number(process.env.JWT_REFRESH_EXPIRES_IN),
    });

    return { access_token, refresh_token };
  }

  async refreshToken(refreshToken: string) {
    try {
      // Verify ther refresh token's signature + expiry using the REFRESH secret
      const payload = await this.jwt.verifyAsync<{
        sub: string;
        email: string;
      }>(refreshToken, { secret: process.env.JWT_REFRESH_SECRET });
      // Token is valid -> issue a fresh pair
      return this.signToken(payload.sub, payload.email);
    } catch {
      throw new ForbiddenException('Invalid or expired refresh token');
    }
  }
}
