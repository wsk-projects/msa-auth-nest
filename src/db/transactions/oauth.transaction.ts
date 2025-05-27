import { Injectable } from '@nestjs/common';
import { OAuthProvider, UserOAuth } from '@prisma/client';
import { GoogleUserInfo } from 'src/api/auth/types/google-user-info.interface';
import { PrismaService } from 'src/common/services/prisma.service';

@Injectable()
export class OAuthTransaction {
  constructor(private readonly prisma: PrismaService) {}

  async signUpGoogle(userInfo: GoogleUserInfo): Promise<UserOAuth> {
    const dbUserOAuth = await this.prisma.client.$transaction(async (tx) => {
      const dbUser = await tx.user.create({ data: {} });

      const dbUserOAuth = await tx.userOAuth.create({
        data: {
          userId: dbUser.id,
          providerId: userInfo.sub,
          provider: OAuthProvider.GOOGLE,
          email: userInfo.email,
        },
      });
      return dbUserOAuth;
    });

    return dbUserOAuth;
  }
}
