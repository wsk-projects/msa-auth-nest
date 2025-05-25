import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { cookieUtil } from 'src/utils/cookie/cookie.util';
import { LoginHistoryService } from './services/login-history.service';
import { TokenService } from './services/token.service';
import { UserAuthService } from './services/user-auth.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly userAuthService: UserAuthService,
    private readonly loginHistoryService: LoginHistoryService,
    private readonly tokenService: TokenService,
  ) {}

  async signup(email: string, password: string) {
    const userAuth = await this.userAuthService.signup(email, password);
    return { id: userAuth.id, email: userAuth.email };
  }

  async checkEmailExists(email: string) {
    const userAuth = await this.userAuthService.findByEmail(email);
    return { exists: !!userAuth };
  }

  async login(email: string, password: string, req: Request, res: Response) {
    const userAuth = await this.userAuthService.findByEmail(email);
    if (!userAuth) throw new UnauthorizedException();
    const { id: dbUserId, email: dbEmail, password: dbPassword } = userAuth;

    const isMatch = await bcrypt.compare(password, dbPassword);
    if (!isMatch) {
      await this.loginHistoryService.createFailure(req, dbUserId);
      throw new UnauthorizedException();
    }
    await this.loginHistoryService.createSuccess(req, dbUserId);

    // 액세스 & 리프레시 토큰 발급
    const accessToken = await this.tokenService.generateToken({ sub: dbUserId, email: dbEmail });
    const refreshToken = await this.tokenService.generateRefreshToken({ sub: dbUserId });

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
    await this.tokenService.blacklistToken(refreshToken);
  }

  async refresh(refreshToken: string, res: Response) {
    const payload = await this.tokenService.verify(refreshToken);
    const userAuth = await this.userAuthService.findById(payload.sub);
    if (!userAuth) throw new UnauthorizedException();

    // 액세스 토큰 발급 & 리프레시 토큰 갱신
    const accessToken = await this.tokenService.generateToken({ sub: userAuth.id, email: userAuth.email });
    const newRefreshToken = await this.tokenService.updateRefreshToken(refreshToken);

    cookieUtil.setCookie(
      res,
      { key: 'refreshToken', value: newRefreshToken },
      { maxAge: this.config.get('JWT_REFRESH_EXPIRES_IN')! },
    );

    return { accessToken };
  }

  async getLoginHistory(userId: number) {
    return await this.loginHistoryService.findByUserId(userId);
  }
}
