import { Injectable } from '@nestjs/common';
import { UserAuth } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/common/services/prisma.service';

@Injectable()
export class SignupTransaction {
  constructor(private readonly prisma: PrismaService) {}

  async signup(email: string, password: string): Promise<UserAuth> {
    const hashedPassword = await bcrypt.hash(password, 10);
    return await this.prisma.client.$transaction(async (tx) => {
      const { id: dbUserId } = await tx.user.create({ data: {} });

      const dbUserAuth = await tx.userAuth.create({
        data: {
          userId: dbUserId,
          email,
          password: hashedPassword,
        },
      });
      return dbUserAuth;
    });
  }
}
