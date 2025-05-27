import { Injectable } from '@nestjs/common';
import { Prisma, UserOAuth } from '@prisma/client';
import { PrismaService } from 'src/common/services/prisma.service';

@Injectable()
export class UserOAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UserOAuthCreateInput): Promise<UserOAuth> {
    return await this.prisma.client.userOAuth.create({
      data,
    });
  }

  async findByProviderId(providerId: string): Promise<UserOAuth | null> {
    return await this.prisma.client.userOAuth.findUnique({
      where: {
        providerId,
      },
    });
  }

  async findByEmail(email: string): Promise<UserOAuth | null> {
    return await this.prisma.client.userOAuth.findFirst({
      where: {
        email,
      },
    });
  }

  async findBy(where: Prisma.UserOAuthWhereUniqueInput): Promise<UserOAuth | null> {
    return await this.prisma.client.userOAuth.findUnique({
      where,
    });
  }
}
