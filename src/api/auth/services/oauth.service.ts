import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginProvider } from '@prisma/client';
import { Request } from 'express';
import { LoginHistoryRepository } from 'src/db/repositories/login-history.repository';
import { UserAuthRepository } from 'src/db/repositories/user-auth.repository';
import { UserOAuthRepository } from 'src/db/repositories/user-oauth.repository';
import { OAuthTransaction } from 'src/db/transactions/oauth.transaction';
import { requestUtil } from 'src/utils/request/request.util';
import { GoogleUserInfo } from '../types/google-user-info.interface';
import { TokenService } from './domain/token.service';

@Injectable()
export class OAuthService {
  private readonly rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  private readonly tokenUrl = 'https://oauth2.googleapis.com/token';
  private readonly userinfoUrl = 'https://www.googleapis.com/oauth2/v3/userinfo';

  constructor(
    private readonly config: ConfigService,
    private readonly userAuthRepository: UserAuthRepository,
    private readonly userOAuthRepository: UserOAuthRepository,
    private readonly loginHistoryRepository: LoginHistoryRepository,
    private readonly tx: OAuthTransaction,
    private readonly tokenService: TokenService,
  ) {}

  getGoogleLoginUrl() {
    const options = {
      redirect_uri: this.config.get('GOOGLE_REDIRECT_URI') as string,
      client_id: this.config.get('GOOGLE_CLIENT_ID') as string,
      scope: ['openid', 'profile', 'email'].join(' '),
      response_type: 'code',
    };
    const params = new URLSearchParams(options);
    return { url: `${this.rootUrl}?${params.toString()}` };
  }

  async handleGoogleLogin(code: string, req: Request) {
    const { access_token } = (await this.fetchAccessToken(code)) as { access_token: string };
    const userInfo = await this.fetchUserInfo(access_token);

    // 소셜 가입여부 확인
    const dbUserOAuth = await this.userOAuthRepository.findByProviderId(userInfo.sub);
    if (dbUserOAuth) {
      const { userId, email } = dbUserOAuth;
      const token = this.tokenService.generateToken({ sub: userId, email });
      const refreshToken = this.tokenService.generateRefreshToken({ sub: userId });

      await this.createSuccessHistory(userId, req);
      return { token, refreshToken };
    } else {
      // 일반 계정 가입 여부 확인
      const dbUser = await this.userAuthRepository.findByEmail(userInfo.email);
      if (dbUser) {
        return {
          message: '이미 가입된 이메일입니다.',
        };
      } else {
        const dbUserOAuth = await this.tx.signUpGoogle(userInfo);

        const { userId, email } = dbUserOAuth;
        const token = this.tokenService.generateToken({ sub: userId, email });
        const refreshToken = this.tokenService.generateRefreshToken({ sub: userId });

        await this.createSuccessHistory(userId, req);
        return { token, refreshToken };
      }
    }
  }

  async createSuccessHistory(userId: number, req: Request): Promise<void> {
    await this.loginHistoryRepository.createSuccess(userId, {
      ip: requestUtil.getIp(req),
      userAgent: requestUtil.getUserAgent(req),
      provider: LoginProvider.GOOGLE,
    });
  }

  private async fetchAccessToken(code: string) {
    const params = new URLSearchParams();
    params.set('client_id', this.config.get('GOOGLE_CLIENT_ID')!);
    params.set('client_secret', this.config.get('GOOGLE_CLIENT_SECRET')!);
    params.set('redirect_uri', this.config.get('GOOGLE_REDIRECT_URI')!);
    params.set('grant_type', 'authorization_code');
    params.set('code', code);

    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new InternalServerErrorException();
    }

    return (await response.json()) as { access_token: string };
  }

  private async fetchUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    const response = await fetch(this.userinfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) throw new InternalServerErrorException();

    const result = (await response.json()) as GoogleUserInfo;
    console.log(result);

    return result;
  }
}
