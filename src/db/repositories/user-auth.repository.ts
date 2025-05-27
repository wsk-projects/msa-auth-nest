import { Injectable } from '@nestjs/common';
import { Prisma, UserAuth } from '@prisma/client';
import { PrismaService } from 'src/common/services/prisma.service';

@Injectable()
export class UserAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UserAuthCreateInput): Promise<UserAuth> {
    return await this.prisma.client.userAuth.create({ data });
  }

  async findById(id: number): Promise<UserAuth | null> {
    return await this.findBy({ id });
  }

  async findByEmail(email: string): Promise<UserAuth | null> {
    return await this.findBy({ email });
  }

  private async findBy(where: Prisma.UserAuthWhereUniqueInput): Promise<UserAuth | null> {
    return await this.prisma.client.userAuth.findUnique({
      where,
    });
  }
}
