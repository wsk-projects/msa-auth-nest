import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { JwtUtil } from 'src/libs/jwt/jwt.util';
import { attempt } from 'src/libs/exception/conditional-catch.util';
import { User } from 'src/user/types/user.entity';
import { AccessPayload } from 'src/libs/jwt/types/access-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly config: ConfigService,
    private readonly jwtUtil: JwtUtil,
  ) {}

  async signup(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userService.create(email, hashedPassword);
    return { id: user.id, email: user.email };
  }

  async login(email: string, password: string) {
    const user = await attempt<User>(() => this.userService.findByEmail(email))
      .expect(NotFoundException)
      .thenThrow(new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.'))
      .elseThrow(new InternalServerErrorException());

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('비밀번호가 일치하지 않습니다');

    // 액세스 토큰 발급
    const accessToken = await this.jwtUtil.signJwt({ sub: user.id, email: user.email }, 'access');

    // 리프레시 토큰 발급
    const refreshToken = await this.jwtUtil.signJwt({ sub: user.id }, 'refresh');

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    const payload = await this.jwtUtil.verifyToken(refreshToken);
    const user = await this.userService.findById(payload.sub);
    if (!user) throw new UnauthorizedException('사용자를 찾을 수 없습니다');

    // 액세스 토큰 발급
    const accessToken = await this.jwtUtil.signJwt({ sub: user.id, email: user.email }, 'access');

    return { accessToken };
  }
}
