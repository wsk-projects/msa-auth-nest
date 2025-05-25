import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/common/services/prisma.service';

@Injectable()
export class UserAuthService {
  constructor(private readonly prisma: PrismaService) {}

  async signup(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return await this.prisma.client.$transaction(async (tx) => {
      const user = await tx.user.create({ data: {} });
      const userAuth = await tx.userAuth.create({
        data: {
          userId: user.id,
          email,
          password: hashedPassword,
        },
      });
      return userAuth;
    });
  }

  async findByEmail(email: string) {
    return await this.findBy({ email });
  }

  async findById(id: number) {
    return await this.findBy({ id });
  }

  private async findBy(where: Prisma.UserAuthWhereUniqueInput) {
    const userAuth = await this.prisma.client.userAuth.findUnique({
      where,
    });
    return userAuth ? userAuth : null;
  }
}
