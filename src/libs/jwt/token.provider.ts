import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AccessPayload } from './types/access-payload.interface';
import { RefreshPayload } from './types/refresh-payload.interface';
import { JwtPayload } from './types/jwt-payload.interface';

@Injectable()
export class TokenProvider {
  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 액세스 토큰 발급
   */
  async generateAccessToken(payload: AccessPayload): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: String(payload.sub),
        email: payload.email,
      },
      { expiresIn: this.config.get<number>('JWT_EXPIRES_IN')! },
    );
  }

  /**
   * 리프레시 토큰 발급
   */
  async generateRefreshToken(payload: RefreshPayload): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: payload.sub,
      },
      { expiresIn: this.config.get<number>('JWT_REFRESH_EXPIRES_IN')! },
    );
  }

  /**
   * 리프레시 토큰 갱신
   */
  async updateRefreshToken(token: string): Promise<string> {
    if (this.shouldRefreshToken(token)) {
      const payload = this.jwtService.verify<RefreshPayload>(token);
      return this.generateRefreshToken({ sub: payload.sub });
    }
    return token;
  }

  /**
   * 리프레시 토큰 갱신 필요 여부 확인
   */
  shouldRefreshToken(token: string): boolean {
    try {
      const decoded = this.jwtService.verify<RefreshPayload>(token);
      if (!decoded || !decoded.exp) return true;

      const expiry = decoded.exp * 1000;
      const current = Date.now();
      const timeToExpiry = expiry - current;

      return (
        timeToExpiry <
        this.config.get<number>('JWT_REFRESH_EXPIRES_IN')! *
          this.config.get<number>('JWT_REFRESH_EXPIRES_IN_THRESHOLD')!
      );
    } catch {
      return true;
    }
  }

  /**
   * 토큰 검증
   */
  async verify(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync<JwtPayload>(token);
  }
}
