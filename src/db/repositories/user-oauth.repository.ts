import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/services/prisma.service';

@Injectable()
export class UserOAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UserOAuthCreateInput) {
    return await this.prisma.client.userOAuth.create({
      data,
    });
  }

  async findByProviderId(providerId: string) {
    return await this.prisma.client.userOAuth.findUnique({
      where: {
        providerId,
      },
    });
  }

  async findBy(where: Prisma.UserOAuthWhereUniqueInput) {
    return await this.prisma.client.userOAuth.findUnique({
      where,
    });
  }
}
