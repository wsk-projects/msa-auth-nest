import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginProvider } from '@prisma/client';
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

  async attemptLogin(email: string, password: string, req: Request) {
    const dbUserAuth = await this.userAuthRepository.findByEmail(email);
    if (!dbUserAuth) throw new UnauthorizedException();

    const isMatch = await bcrypt.compare(password, dbUserAuth.password);
    if (!isMatch) await this.createFailureHistory(dbUserAuth.userId, req);

    await this.createSuccessHistory(dbUserAuth.userId, req);
    return dbUserAuth;
  }

  async createSuccessHistory(userId: number, req: Request): Promise<void> {
    await this.loginHistoryRepository.createSuccess(userId, {
      ip: requestUtil.getIp(req),
      userAgent: requestUtil.getUserAgent(req),
      provider: LoginProvider.LOCAL,
    });
  }

  async createFailureHistory(userId: number, req: Request): Promise<void> {
    await this.loginHistoryRepository.createFailure(userId, {
      ip: requestUtil.getIp(req),
      userAgent: requestUtil.getUserAgent(req),
      provider: LoginProvider.LOCAL,
    });
  }

  async getHistory(userId: number) {
    return await this.loginHistoryRepository.findManyByUserId(userId);
  }
}
