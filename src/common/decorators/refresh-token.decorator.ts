import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { cookieUtil } from 'src/utils/cookie/cookie.util';

export const RefreshToken = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>();
  const refreshToken = cookieUtil.getCookie(request, 'refreshToken');
  if (!refreshToken) throw new UnauthorizedException('세션이 만료되었습니다. 다시 로그인해주세요.');

  return refreshToken;
});
