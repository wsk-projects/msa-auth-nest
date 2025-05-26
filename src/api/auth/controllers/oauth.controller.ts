import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { OAuthService } from '../services/oauth.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('OAuth')
@Controller('auth')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  @ApiOperation({ summary: '구글 로그인' })
  @ApiResponse({ status: 200 })
  @Get('google/login')
  googleLogin() {
    return this.oauthService.getGoogleLoginUrl();
  }

  @ApiOperation({ summary: '구글 로그인 콜백' })
  @ApiResponse({ status: 200 })
  @Get('google/callback')
  async googleCallback(@Query('code') code: string, @Req() req: Request, @Res() res: Response) {
    const tokens = await this.oauthService.handleGoogleLogin(code, req);
    return res.json(tokens);
  }
}
