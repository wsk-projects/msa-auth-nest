import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AccessPayload } from 'src/utils/jwt/types/access-payload.interface';
import { UserIdentityDto } from 'src/api/user/dto/response/user-identity.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: AccessPayload): Promise<UserIdentityDto> {
    return { userId: Number(payload.sub), email: payload.email };
  }
}
