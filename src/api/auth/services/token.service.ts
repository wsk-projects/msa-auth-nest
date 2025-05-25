import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { AccessPayload } from 'src/types/jwt/access-payload.interface';
import { TokenProvider } from '../providers/token.provider';
import { RefreshPayload } from 'src/types/jwt/refresh-payload.interface';

@Injectable()
export class TokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenProvider: TokenProvider,
  ) {}

  async generateToken(payload: AccessPayload) {
    const accessToken = await this.tokenProvider.generateAccessToken(payload);
    return accessToken;
  }

  async generateRefreshToken(payload: RefreshPayload) {
    const refreshToken = await this.tokenProvider.generateRefreshToken(payload);
    return refreshToken;
  }

  async updateRefreshToken(refreshToken: string) {
    if (this.tokenProvider.shouldRefreshToken(refreshToken)) {
      const payload = await this.tokenProvider.verify(refreshToken);
      const newRefreshToken = await this.tokenProvider.generateRefreshToken(payload);
      return newRefreshToken;
    }
    return refreshToken;
  }

  async verify(token: string) {
    if (await this.isBlacklisted(token)) throw new UnauthorizedException();
    return await this.tokenProvider.verify(token);
  }

  async blacklistToken(token: string) {
    const payload = await this.tokenProvider.verify(token);
    await this.prisma.client.refreshTokenBlacklist.create({
      data: {
        token,
        expiresAt: new Date(payload.exp! * 1000),
      },
    });
  }

  async isBlacklisted(token: string) {
    const blacklistedToken = await this.prisma.client.refreshTokenBlacklist.findUnique({
      where: { token },
    });
    return !!blacklistedToken;
  }
}
