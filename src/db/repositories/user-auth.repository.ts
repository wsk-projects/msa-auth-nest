import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/services/prisma.service';

@Injectable()
export class UserAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UserAuthCreateInput) {
    return await this.prisma.client.userAuth.create({ data });
  }

  async findById(id: number) {
    return await this.findBy({ id });
  }

  async findByEmail(email: string) {
    return await this.findBy({ email });
  }

  private async findBy(where: Prisma.UserAuthWhereUniqueInput) {
    const userAuth = await this.prisma.client.userAuth.findUnique({
      where,
    });
    return userAuth ? userAuth : null;
  }
}
