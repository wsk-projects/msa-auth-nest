import { Injectable } from '@nestjs/common';
import { LoginStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/services/prisma.service';

@Injectable()
export class LoginHistoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createSuccess(userId: number, data: Pick<Prisma.LoginHistoryCreateInput, 'ip' | 'userAgent' | 'provider'>) {
    return await this.prisma.client.loginHistory.create({
      data: {
        ...data,
        status: LoginStatus.SUCCESS,
        User: { connect: { id: userId } },
      },
    });
  }

  async createFailure(userId: number, data: Pick<Prisma.LoginHistoryCreateInput, 'ip' | 'userAgent' | 'provider'>) {
    return await this.prisma.client.loginHistory.create({
      data: {
        ...data,
        status: LoginStatus.FAILED,
        User: { connect: { id: userId } },
      },
    });
  }

  async findById(id: number) {
    return await this.findBy({ id });
  }

  async findManyByUserId(userId: number) {
    return await this.findManyBy({ userId });
  }

  private async findBy(where: Prisma.LoginHistoryWhereUniqueInput) {
    const loginHistory = await this.prisma.client.loginHistory.findUnique({
      where,
    });
    return loginHistory ? loginHistory : null;
  }

  private async findManyBy(where: Prisma.LoginHistoryWhereInput) {
    return await this.prisma.client.loginHistory.findMany({
      where,
      orderBy: { id: 'desc' },
    });
  }
}
