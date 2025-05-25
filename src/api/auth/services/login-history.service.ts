import { LoginStatus } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/common/services/prisma.service';
@Injectable()
export class LoginHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async createSuccess(req: Request, userId: number): Promise<void> {
    await this.prisma.client.loginHistory.create({
      data: {
        userId,
        ip: req.ip?.replace('::ffff:', ''),
        userAgent: req.headers['user-agent'],
        status: LoginStatus.SUCCESS,
      },
    });
  }

  async createFailure(req: Request, userId: number): Promise<void> {
    await this.prisma.client.loginHistory.create({
      data: {
        userId,
        ip: req.ip?.replace('::ffff:', ''),
        userAgent: req.headers['user-agent'],
        status: LoginStatus.FAILED,
      },
    });
  }

  async findByUserId(userId: number) {
    return await this.prisma.client.loginHistory.findMany({
      where: { userId },
      orderBy: { id: 'desc' },
    });
  }
}
