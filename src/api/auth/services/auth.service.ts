import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { TokenProvider } from 'src/api/auth/providers/token.provider';
import { UserService } from 'src/api/user/user.service';
import prisma from 'src/libs/prisma/prisma-client';
import { cookieUtil } from 'src/utils/cookie/cookie.util';
import { LoginHistoryService } from './login-history.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly userService: UserService,
    private readonly loginHistoryService: LoginHistoryService,
    private readonly tokenProvider: TokenProvider,
  ) {}

  async signup(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userService.create(email, hashedPassword);
    return { id: user.id, email: user.email };
  }

  async login(email: string, password: string, req: Request, res: Response) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException();

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await this.loginHistoryService.createFailure(req, user.id);
      throw new UnauthorizedException();
    }
    await this.loginHistoryService.createSuccess(req, user.id);

    // 액세스 & 리프레시 토큰 발급
    const accessToken = await this.tokenProvider.generateAccessToken({ sub: user.id, email: user.email });
    const refreshToken = await this.tokenProvider.generateRefreshToken({ sub: user.id });

    // 리프레시 토큰을 쿠키에 저장
    cookieUtil.setCookie(
      res,
      { key: 'refreshToken', value: refreshToken },
      { maxAge: this.config.get('JWT_REFRESH_EXPIRES_IN')! },
    );

    return { accessToken };
  }

  async logout(refreshToken: string, res: Response) {
    // 쿠키에서 리프레시 토큰 삭제
    cookieUtil.deleteCookie(res, 'refreshToken');

    const payload = await this.tokenProvider.verify(refreshToken);
    await prisma.refreshTokenBlacklist.create({
      data: {
        token: refreshToken,
        expiresAt: new Date(payload.exp! * 1000),
      },
    });
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const blacklistedToken = await prisma.refreshTokenBlacklist.findUnique({
      where: { token },
    });
    return !!blacklistedToken;
  }

  async refresh(refreshToken: string, res: Response) {
    if (await this.isBlacklisted(refreshToken)) {
      throw new UnauthorizedException();
    }

    const payload = await this.tokenProvider.verify(refreshToken);
    const user = await this.userService.findById(payload.sub);
    if (!user) throw new UnauthorizedException();

    // 액세스 토큰 발급 & 리프레시 토큰 갱신
    const accessToken = await this.tokenProvider.generateAccessToken({ sub: user.id, email: user.email });

    const newRefreshToken = this.tokenProvider.shouldRefreshToken(refreshToken)
      ? await this.tokenProvider.generateRefreshToken({ sub: user.id })
      : refreshToken;

    cookieUtil.setCookie(
      res,
      { key: 'refreshToken', value: newRefreshToken },
      { maxAge: this.config.get('JWT_REFRESH_EXPIRES_IN')! },
    );

    return { accessToken };
  }
}
