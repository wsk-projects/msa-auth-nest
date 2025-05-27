import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginHistory, LoginProvider, UserAuth } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { LoginHistoryRepository } from 'src/db/repositories/login-history.repository';
import { UserAuthRepository } from '../../../../db/repositories/user-auth.repository';
import { requestUtil } from '../../../../utils/request/request.util';

@Injectable()
export class LoginService {
  constructor(
    private readonly userAuthRepository: UserAuthRepository,
    private readonly loginHistoryRepository: LoginHistoryRepository,
  ) {}

  async attemptLogin(email: string, password: string, req: Request): Promise<UserAuth> {
    const dbUserAuth = await this.userAuthRepository.findByEmail(email);
    if (!dbUserAuth) throw new UnauthorizedException();

    const isMatch = await bcrypt.compare(password, dbUserAuth.password);
    if (!isMatch) await this.createFailureHistory(dbUserAuth.userId, LoginProvider.LOCAL, req);

    await this.createSuccessHistory(dbUserAuth.userId, LoginProvider.LOCAL, req);
    return dbUserAuth;
  }

  async createSuccessHistory(userId: number, provider: LoginProvider, req: Request): Promise<void> {
    await this.loginHistoryRepository.createSuccess(userId, {
      ip: requestUtil.getIp(req),
      userAgent: requestUtil.getUserAgent(req),
      provider,
    });
  }

  async createFailureHistory(userId: number, provider: LoginProvider, req: Request): Promise<void> {
    await this.loginHistoryRepository.createFailure(userId, {
      ip: requestUtil.getIp(req),
      userAgent: requestUtil.getUserAgent(req),
      provider,
    });
  }

  async getHistory(userId: number): Promise<LoginHistory[]> {
    return await this.loginHistoryRepository.findManyByUserId(userId);
  }
}
