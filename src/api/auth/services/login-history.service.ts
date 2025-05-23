import { LoginStatus } from '@generated/prisma';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import prisma from 'src/libs/prisma/prisma-client';

@Injectable()
export class LoginHistoryService {
  async createSuccess(req: Request, userId: number): Promise<void> {
    await prisma.loginHistory.create({
      data: {
        userId,
        ip: req.ip?.replace('::ffff:', ''),
        userAgent: req.headers['user-agent'],
        status: LoginStatus.SUCCESS,
      },
    });
  }

  async createFailure(req: Request, userId: number): Promise<void> {
    await prisma.loginHistory.create({
      data: {
        userId,
        ip: req.ip?.replace('::ffff:', ''),
        userAgent: req.headers['user-agent'],
        status: LoginStatus.FAILED,
      },
    });
  }
}
