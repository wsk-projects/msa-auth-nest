import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ JWT payload:', {
        ...payload,
        issued: new Date(payload.iat * 1000).toISOString(),
        expires: new Date(payload.exp * 1000).toISOString(),
      });
    }
    return { userId: payload.sub, email: payload.email };
  }
}
