import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { cookieUtil } from 'src/utils/cookie/cookie.util';
import { LoginService } from './services/login.service';
import { SignupService } from './services/signup.service';
import { TokenService } from './services/token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly userAuthService: SignupService,
    private readonly loginService: LoginService,
    private readonly tokenService: TokenService,
  ) {}

  async signup(email: string, password: string) {
    const dbUserAuth = await this.userAuthService.signup(email, password);
    return { id: dbUserAuth.id, email: dbUserAuth.email };
  }

  async checkEmailExists(email: string) {
    const dbUserAuth = await this.userAuthService.findByEmail(email);
    return { exists: !!dbUserAuth };
  }

  async login(email: string, password: string, req: Request, res: Response) {
    const { userId: dbUserId, email: dbEmail } = await this.loginService.attemptLogin(email, password, req);

    const accessToken = this.tokenService.generateToken({ sub: dbUserId, email: dbEmail });
    const refreshToken = this.tokenService.generateRefreshToken({ sub: dbUserId });

    cookieUtil.setCookie(
      res,
      { key: 'refreshToken', value: refreshToken },
      { maxAge: this.config.get('JWT_REFRESH_EXPIRES_IN')! },
    );
    return { accessToken };
  }

  async logout(refreshToken: string, res: Response) {
    cookieUtil.deleteCookie(res, 'refreshToken');
    await this.tokenService.blacklistToken(refreshToken);
  }

  async refresh(refreshToken: string, res: Response) {
    const payload = await this.tokenService.verify(refreshToken);
    const userAuth = await this.userAuthService.findById(payload.sub);
    if (!userAuth) throw new UnauthorizedException();

    const accessToken = this.tokenService.generateToken({ sub: userAuth.id, email: userAuth.email });
    const newRefreshToken = this.tokenService.updateRefreshToken(refreshToken);

    cookieUtil.setCookie(
      res,
      { key: 'refreshToken', value: newRefreshToken },
      { maxAge: this.config.get('JWT_REFRESH_EXPIRES_IN')! },
    );

    return { accessToken };
  }

  async getLoginHistory(userId: number) {
    return await this.loginService.getHistory(userId);
  }
}
