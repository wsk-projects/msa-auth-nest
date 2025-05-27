import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { Token } from 'src/common/types/token.interface';
import { GoogleLoginService } from './usecases/google-login.service';

@Injectable()
export class OAuthService {
  constructor(private readonly googleLoginService: GoogleLoginService) {}

  getGoogleLoginUrl(): { url: string } {
    return this.googleLoginService.getLoginUrl();
  }

  async handleGoogleLogin(code: string, req: Request, res: Response): Promise<Token> {
    return this.googleLoginService.handleLogin(code, req, res);
  }
}
