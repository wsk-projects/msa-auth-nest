import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { UserIdentity } from 'src/common/types/user-identity.interface';

interface RequestAfterJwtGuard extends Request {
  user: UserIdentity;
}

export const LoginUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): UserIdentity => {
  const request = ctx.switchToHttp().getRequest<RequestAfterJwtGuard>();
  if (!request.user) throw new UnauthorizedException('로그인이 필요한 기능입니다.');

  return request.user;
});
