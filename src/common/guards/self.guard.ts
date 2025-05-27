import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { UserIdentity } from '../types/user-identity.interface';

interface RequestAfterJwtGuard extends Request {
  user: UserIdentity;
}

@Injectable()
export class SelfGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestAfterJwtGuard>();
    const user = request.user;
    if (!user) throw new UnauthorizedException();

    const requestedUserId = Number(request.query.userId);

    if (requestedUserId !== user.userId) {
      throw new ForbiddenException();
    }

    return true;
  }
}
