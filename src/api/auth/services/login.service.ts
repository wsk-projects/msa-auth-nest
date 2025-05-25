import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { LoginHistoryRepository } from 'src/db/repositories/login-history.repository';
import { UserAuthRepository } from '../../../db/repositories/user-auth.repository';
import { LoginStatus } from '@prisma/client';

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
    if (!isMatch) await this.createFailureHistory(req, dbUserAuth.userId);

    await this.createSuccessHistory(req, dbUserAuth.userId);
    return dbUserAuth;
  }

  async createSuccessHistory(req: Request, userId: number): Promise<void> {
    await this.loginHistoryRepository.create({
      User: {
        connect: { id: userId },
      },
      ip: req.ip?.replace('::ffff:', ''),
      userAgent: req.headers['user-agent'],
      status: LoginStatus.SUCCESS,
    });
  }

  async createFailureHistory(req: Request, userId: number): Promise<void> {
    await this.loginHistoryRepository.create({
      User: {
        connect: { id: userId },
      },
      ip: req.ip?.replace('::ffff:', ''),
      userAgent: req.headers['user-agent'],
      status: LoginStatus.FAILED,
    });
  }

  async getHistory(userId: number) {
    return await this.loginHistoryRepository.findManyByUserId(userId);
  }
}
