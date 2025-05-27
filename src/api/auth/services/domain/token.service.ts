import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { jwtUtil } from 'src/utils/jwt/jwt.util';
import { AccessPayload } from 'src/utils/jwt/types/access-payload.interface';
import { JwtPayload } from 'src/utils/jwt/types/jwt-payload.interface';
import { RefreshPayload } from 'src/utils/jwt/types/refresh-payload.interface';

@Injectable()
export class TokenService {
  constructor(private readonly prisma: PrismaService) {}

  generateToken(payload: AccessPayload): string {
    const accessToken = jwtUtil.generateAccessToken(payload);
    return accessToken;
  }

  generateRefreshToken(payload: RefreshPayload): string {
    const refreshToken = jwtUtil.generateRefreshToken(payload);
    return refreshToken;
  }

  updateRefreshToken(refreshToken: string): string {
    if (jwtUtil.shouldRefreshToken(refreshToken)) {
      const payload = jwtUtil.verify(refreshToken);
      const newRefreshToken = jwtUtil.generateRefreshToken(payload);
      return newRefreshToken;
    }
    return refreshToken;
  }

  async verify(token: string): Promise<JwtPayload> {
    if (await this.isBlacklisted(token)) throw new UnauthorizedException();
    return jwtUtil.verify(token);
  }

  async blacklistToken(token: string): Promise<void> {
    const payload = jwtUtil.verify(token);
    await this.prisma.client.refreshTokenBlacklist.create({
      data: {
        token,
        expiresAt: new Date(payload.exp! * 1000),
      },
    });
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const blacklistedToken = await this.prisma.client.refreshTokenBlacklist.findUnique({
      where: { token },
    });
    return !!blacklistedToken;
  }
}
