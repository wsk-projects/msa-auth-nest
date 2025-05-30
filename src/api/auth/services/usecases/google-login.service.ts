import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginProvider, UserOAuth } from '@prisma/client';
import { Request, Response } from 'express';
import { Token } from 'src/common/types/token.interface';
import { UserOAuthRepository } from 'src/db/repositories/user-oauth.repository';
import { OAuthTransaction } from 'src/db/transactions/oauth.transaction';
import { GoogleUserInfo } from '../../types/google-user-info.interface';
import { CredentialService } from '../domain/credentail.service';
import { TokenService } from '../domain/token.service';
import { LoginService } from './login.service';

@Injectable()
export class GoogleLoginService {
  private readonly authUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  private readonly tokenUrl = 'https://oauth2.googleapis.com/token';
  private readonly userinfoUrl = 'https://www.googleapis.com/oauth2/v3/userinfo';
  constructor(
    private readonly config: ConfigService,
    private readonly userOAuthRepository: UserOAuthRepository,
    private readonly tx: OAuthTransaction,
    private readonly tokenService: TokenService,
    private readonly loginService: LoginService,
    private readonly credentialService: CredentialService,
  ) {}

  getLoginUrl(): { url: string } {
    const options = {
      redirect_uri: this.config.get('GOOGLE_REDIRECT_URI') as string,
      client_id: this.config.get('GOOGLE_CLIENT_ID') as string,
      scope: ['openid', 'profile', 'email'].join(' '),
      response_type: 'code',
    };
    const params = new URLSearchParams(options);
    return { url: `${this.authUrl}?${params.toString()}` };
  }

  async handleLogin(code: string, req: Request, res: Response): Promise<Token> {
    const { access_token } = await this.fetchAccessToken(code);
    const userInfo = await this.fetchUserInfo(access_token);

    // 소셜 가입여부 확인
    const dbUserOAuth = await this.userOAuthRepository.findByProviderId(String(userInfo.sub));
    if (dbUserOAuth) {
      return this.handleExistingUser(dbUserOAuth, req, res);
    } else {
      return this.handleNewUser(userInfo, req, res);
    }
  }

  private async handleExistingUser(dbUserOAuth: UserOAuth, req: Request, res: Response): Promise<Token> {
    const { userId } = dbUserOAuth;
    const accessToken = this.tokenService.generateToken({ sub: userId });
    const refreshToken = this.tokenService.generateRefreshToken({ sub: userId });
    this.credentialService.setRefreshToken(res, refreshToken);
    await this.loginService.createSuccessHistory(userId, LoginProvider.GOOGLE, req);

    return { accessToken };
  }

  private async handleNewUser(userInfo: GoogleUserInfo, req: Request, res: Response): Promise<Token> {
    const { userId } = await this.tx.signUpGoogle(userInfo);
    const accessToken = this.tokenService.generateToken({ sub: userId });
    const refreshToken = this.tokenService.generateRefreshToken({ sub: userId });
    this.credentialService.setRefreshToken(res, refreshToken);
    await this.loginService.createSuccessHistory(userId, LoginProvider.GOOGLE, req);

    return { accessToken };
  }

  private async fetchAccessToken(code: string): Promise<{ access_token: string }> {
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
