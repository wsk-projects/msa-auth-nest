import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AccessPayload } from 'src/libs/jwt/types/access-payload.interface';
import { UserIdentity } from 'src/common/types/user-identity.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: AccessPayload): Promise<UserIdentity> {
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
