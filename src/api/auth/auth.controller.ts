import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LoginUser } from 'src/common/decorators/login-user.decorator';
import { RefreshToken } from 'src/common/decorators/refresh-token.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserIdentityDto } from 'src/api/user/dto/response/user-identity.dto';
import { AuthService } from './services/auth.service';
import { LoginDto } from './dto/request/login.dto';
import { SignupDto } from './dto/request/signup.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        email: { type: 'string', example: 'user@example.com' },
      },
    },
  })
  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto.email, dto.password);
  }

  @ApiOperation({ summary: '로그인' })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res() res: Response) {
    const result = await this.authService.login(dto.email, dto.password, req, res);
    return res.json(result);
  }

  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  @Post('logout')
  async logout(@RefreshToken() refreshToken: string, @Res() res: Response) {
    await this.authService.logout(refreshToken, res);
    return res.json();
  }

  @ApiOperation({ summary: '토큰 갱신' })
  @ApiResponse({
    status: 200,
    description: '토큰 갱신 성공',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
      },
    },
  })
  @Post('refresh')
  async refresh(@RefreshToken() refreshToken: string, @Res() res: Response) {
    const result = await this.authService.refresh(refreshToken, res);
    return res.json(result);
  }

  @ApiOperation({ summary: '프로필 조회' })
  @ApiResponse({
    status: 200,
    description: '프로필 조회 성공',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'number', example: 1 },
        email: { type: 'string', example: 'user@example.com' },
      },
    },
  })
  @ApiBearerAuth('access-token')
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@LoginUser() user: UserIdentityDto) {
    return user;
  }
}
