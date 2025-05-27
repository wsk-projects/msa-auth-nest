import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Token } from 'src/common/types/token.interface';
import { responseUtil } from 'src/utils/response/response.util';
import { ApiResult } from 'src/utils/response/types/api-result.interface';
import { OAuthService } from '../services/oauth.service';

@ApiTags('OAuth')
@Controller('auth')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  @ApiOperation({ summary: '구글 로그인' })
  @ApiResponse({ status: 200 })
  @Get('google/login')
  googleLogin(): ApiResult<{ url: string }> {
    const url = this.oauthService.getGoogleLoginUrl();
    return responseUtil.success(url);
  }

  @ApiOperation({ summary: '구글 로그인 콜백' })
  @ApiResponse({ status: 200 })
  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<ApiResult<Token>> {
    const accessToken = await this.oauthService.handleGoogleLogin(code, req, res);
    return responseUtil.success(accessToken);
  }
}
