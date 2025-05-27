import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { responseUtil } from 'src/utils/response/response.util';
import { ApiResult } from 'src/utils/response/types/api-result.interface';
import { AuthService } from '../services/auth.service';
import { CheckEmailRequest } from './request/check-email.request';
import { SignupRequest } from './request/signup.request';

@ApiTags('Auth')
@Controller('auth')
export class SignupController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({ status: 200 })
  @Post('signup')
  async signup(@Body() dto: SignupRequest): Promise<ApiResult<void>> {
    await this.authService.signup(dto.email, dto.password);
    return responseUtil.success();
  }

  @ApiOperation({ summary: '이메일 중복 확인' })
  @ApiResponse({ status: 200 })
  @Get('exists')
  async checkEmail(@Query() dto: CheckEmailRequest): Promise<ApiResult<{ exists: boolean }>> {
    const exists = await this.authService.checkEmailExists(dto.email);
    return responseUtil.success(exists);
  }
}
