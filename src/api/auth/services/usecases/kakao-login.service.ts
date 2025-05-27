import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginProvider, UserOAuth } from '@prisma/client';
import { Request, Response } from 'express';
import { Token } from 'src/common/types/token.interface';
import { UserOAuthRepository } from 'src/db/repositories/user-oauth.repository';
import { OAuthTransaction } from 'src/db/transactions/oauth.transaction';
import { KakaoUserInfo } from '../../types/kakao-user-info.interface';
import { CredentialService } from '../domain/credentail.service';
import { TokenService } from '../domain/token.service';
import { LoginService } from './login.service';

@Injectable()
export class KakaoLoginService {
  private readonly authUrl = 'https://kauth.kakao.com/oauth/authorize';
  private readonly tokenUrl = 'https://kauth.kakao.com/oauth/token';
  private readonly userinfoUrl = 'https://kapi.kakao.com/v2/user/me';
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
      redirect_uri: this.config.get('KAKAO_REDIRECT_URI') as string,
      client_id: this.config.get('KAKAO_CLIENT_ID') as string,
      response_type: 'code',
    };
    const params = new URLSearchParams(options);
    return { url: `${this.authUrl}?${params.toString()}` };
  }

  async handleLogin(code: string, req: Request, res: Response): Promise<Token> {
    const { access_token } = await this.fetchAccessToken(code);
    const userInfo = await this.fetchUserInfo(access_token);

    // 소셜 가입여부 확인
    const dbUserOAuth = await this.userOAuthRepository.findByProviderId(String(userInfo.id));
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
    await this.loginService.createSuccessHistory(userId, LoginProvider.KAKAO, req);

    return { accessToken };
  }

  private async handleNewUser(userInfo: KakaoUserInfo, req: Request, res: Response): Promise<Token> {
    const { userId } = await this.tx.signUpKakao(userInfo);
    const accessToken = this.tokenService.generateToken({ sub: userId });
    const refreshToken = this.tokenService.generateRefreshToken({ sub: userId });
    this.credentialService.setRefreshToken(res, refreshToken);
    await this.loginService.createSuccessHistory(userId, LoginProvider.KAKAO, req);

    return { accessToken };
  }

  private async fetchAccessToken(code: string): Promise<{ access_token: string }> {
    const params = new URLSearchParams();
    params.set('client_id', this.config.get('KAKAO_CLIENT_ID')!);
    params.set('client_secret', this.config.get('KAKAO_CLIENT_SECRET')!);
    params.set('redirect_uri', this.config.get('KAKAO_REDIRECT_URI')!);
    params.set('code', code);
    params.set('grant_type', 'authorization_code');

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

  private async fetchUserInfo(access_token: string): Promise<KakaoUserInfo> {
    const response = await fetch(this.userinfoUrl, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!response.ok) throw new InternalServerErrorException();

    const res = (await response.json()) as unknown;
    console.log(res);
    const result = res as KakaoUserInfo;
    console.log(result);

    return result;
  }
}
