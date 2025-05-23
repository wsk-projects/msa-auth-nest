import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { attempt } from '../assertion/conditional-catch';
import { JwtPayload } from './types/jwt-payload.interface';

@Injectable()
export class JwtUtil {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async signJwt(payload: any, tokenType: 'access' | 'refresh'): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn:
        tokenType === 'refresh'
          ? this.config.get<string>('JWT_REFRESH_EXPIRES_IN')!
          : this.config.get<string>('JWT_EXPIRES_IN')!,
    });
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    return attempt<JwtPayload>(() =>
      this.jwtService.verifyAsync<JwtPayload>(token, { secret: this.config.get('JWT_SECRET') }),
    )
      .expect(TokenExpiredError)
      .thenThrow(new UnauthorizedException('토큰이 만료되었습니다.'))
      .elseThrow(new UnauthorizedException('유효하지 않은 토큰입니다.'));
  }
}
