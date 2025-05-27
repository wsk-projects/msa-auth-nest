import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginHistory } from '@prisma/client';
import { Request, Response } from 'express';
import { LoginUser } from 'src/common/decorators/login-user.decorator';
import { RefreshToken } from 'src/common/decorators/refresh-token.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Token } from 'src/common/types/token.interface';
import { UserIdentity } from 'src/common/types/user-identity.interface';
import { responseUtil } from 'src/utils/response/response.util';
import { ApiResult } from 'src/utils/response/types/api-result.interface';
import { AuthService } from '../services/auth.service';
import { LoginRequest } from './request/login.request';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ status: 200 })
  @Post('login')
  async login(
    @Body() dto: LoginRequest,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResult<Token>> {
    const accessToken = await this.authService.login(dto.email, dto.password, req, res);
    return responseUtil.success(accessToken);
  }

  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ status: 200 })
  @Post('logout')
  async logout(
    @RefreshToken() refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResult<void>> {
    await this.authService.logout(refreshToken, res);
    return responseUtil.success();
  }

  @ApiOperation({ summary: '토큰 갱신' })
  @ApiResponse({ status: 200 })
  @Post('refresh')
  async refresh(
    @RefreshToken() refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResult<Token>> {
    const accessToken = await this.authService.refresh(refreshToken, res);
    return responseUtil.success(accessToken);
  }

  @ApiOperation({ summary: '로그인 기록 조회' })
  @ApiResponse({ status: 200 })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get('login-history')
  async getLoginHistory(@LoginUser() loginUser: UserIdentity): Promise<ApiResult<LoginHistory[]>> {
    const loginHistories = await this.authService.getLoginHistory(loginUser.userId);
    return responseUtil.success(loginHistories);
  }
}
