import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async signup(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userService.create(email, hashedPassword);
    return { id: user.id, email: user.email };
  }

  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('사용자를 찾을 수 없습니다');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다');

    // 액세스
    const payload = {
      sub: user.id,
      email: user.email,
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.config.get('JWT_EXPIRES_IN'),
    });

    // 리프레시
    const refreshPayload = {
      sub: user.id,
    };
    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN'),
    });

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    const payload = this.jwtService.verify(refreshToken);
    const user = await this.userService.findById(payload.sub);
    if (!user) throw new UnauthorizedException('사용자를 찾을 수 없습니다');

    const newPayload = { sub: user.id, email: user.email };
    const newAccessToken = await this.jwtService.signAsync(newPayload, {
      expiresIn: this.config.get('JWT_EXPIRES_IN'),
    });

    return { accessToken: newAccessToken };
  }
}
