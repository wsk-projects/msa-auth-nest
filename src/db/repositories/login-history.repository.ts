import { Injectable } from '@nestjs/common';
import { LoginHistory, LoginStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/services/prisma.service';

@Injectable()
export class LoginHistoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createSuccess(
    userId: number,
    data: Pick<Prisma.LoginHistoryCreateInput, 'ip' | 'userAgent' | 'provider'>,
  ): Promise<LoginHistory> {
    return await this.prisma.client.loginHistory.create({
      data: {
        ...data,
        status: LoginStatus.SUCCESS,
        User: { connect: { id: userId } },
      },
    });
  }

  async createFailure(
    userId: number,
    data: Pick<Prisma.LoginHistoryCreateInput, 'ip' | 'userAgent' | 'provider'>,
  ): Promise<LoginHistory> {
    return await this.prisma.client.loginHistory.create({
      data: {
        ...data,
        status: LoginStatus.FAILED,
        User: { connect: { id: userId } },
      },
    });
  }

  async findById(id: number): Promise<LoginHistory | null> {
    return await this.findBy({ id });
  }

  async findManyByUserId(userId: number): Promise<LoginHistory[]> {
    return await this.findManyBy({ userId });
  }

  private async findBy(where: Prisma.LoginHistoryWhereUniqueInput): Promise<LoginHistory | null> {
    return await this.prisma.client.loginHistory.findUnique({
      where,
    });
  }

  private async findManyBy(where: Prisma.LoginHistoryWhereInput): Promise<LoginHistory[]> {
    return await this.prisma.client.loginHistory.findMany({
      where,
      orderBy: { id: 'desc' },
    });
  }
}
