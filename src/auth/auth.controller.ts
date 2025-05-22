import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { LoginUser } from 'src/common/decorators/login-user.decorator';
import { RefreshToken } from 'src/common/decorators/refresh-token.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserIdentity } from 'src/common/types/user-identity.interface';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto.email, dto.password);
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    const result = await this.authService.login(dto.email, dto.password, res);
    return res.json(result);
  }

  @Post('logout')
  logout(@RefreshToken() refreshToken: string) {
    return this.authService.logout(refreshToken);
  }

  @Post('refresh')
  async refresh(@RefreshToken() refreshToken: string, @Res() res: Response) {
    const result = await this.authService.refresh(refreshToken, res);
    return res.json(result);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@LoginUser() user: UserIdentity) {
    return user;
  }
}
