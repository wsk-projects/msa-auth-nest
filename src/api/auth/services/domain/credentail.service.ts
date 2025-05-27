import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { cookieUtil } from 'src/utils/cookie/cookie.util';

@Injectable()
export class CredentialService {
  constructor(private readonly config: ConfigService) {}

  setRefreshToken(res: Response, refreshToken: string): void {
    cookieUtil.setCookie(
      res,
      { key: 'refreshToken', value: refreshToken },
      { maxAge: this.config.get('JWT_REFRESH_EXPIRES_IN') },
    );
  }
}
