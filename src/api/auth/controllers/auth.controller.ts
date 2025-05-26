import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LoginUser } from 'src/common/decorators/login-user.decorator';
import { RefreshToken } from 'src/common/decorators/refresh-token.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserIdentityDto } from 'src/api/user/dto/response/user-identity.dto';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/request/login.dto';
import { SignupDto } from '../dto/request/signup.dto';
import { CheckEmailDto } from '../dto/request/check-email.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({ status: 200 })
  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto.email, dto.password);
  }

  @ApiOperation({ summary: '이메일 중복 확인' })
  @ApiResponse({ status: 200 })
  @Get('exists')
  checkEmail(@Query() dto: CheckEmailDto) {
    return this.authService.checkEmailExists(dto.email);
  }

  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ status: 200 })
  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res() res: Response) {
    const result = await this.authService.login(dto.email, dto.password, req, res);
    return res.json(result);
  }

  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ status: 200 })
  @Post('logout')
  async logout(@RefreshToken() refreshToken: string, @Res() res: Response) {
    await this.authService.logout(refreshToken, res);
    return res.json();
  }

  @ApiOperation({ summary: '토큰 갱신' })
  @ApiResponse({ status: 200 })
  @Post('refresh')
  async refresh(@RefreshToken() refreshToken: string, @Res() res: Response) {
    const result = await this.authService.refresh(refreshToken, res);
    return res.json(result);
  }

  @ApiOperation({ summary: '프로필 조회' })
  @ApiResponse({ status: 200 })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@LoginUser() loginUser: UserIdentityDto) {
    return loginUser;
  }

  @ApiOperation({ summary: '로그인 기록 조회' })
  @ApiResponse({ status: 200 })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get('login-history')
  getLoginHistory(@LoginUser() loginUser: UserIdentityDto) {
    return this.authService.getLoginHistory(loginUser.userId);
  }
}
