import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { cookieUtil } from 'src/utils/cookie/cookie.util';
import { attempt } from 'src/utils/assertion/conditional-catch';
import { TokenProvider } from 'src/api/auth/providers/token.provider';
import { User } from 'src/api/user/entities/user.entity';
import { UserService } from 'src/api/user/user.service';

@Injectable()
export class AuthService {
  private blacklist: Set<string> = new Set(); // 메모리 블랙리스트

  constructor(
    private readonly config: ConfigService,
    private readonly userService: UserService,
    private readonly jwtProvider: TokenProvider,
  ) {}

  async signup(email: string, password: string) {
    // eslint-disable-next-line
    const hashedPassword = (await bcrypt.hash(password, 10)) as string;
    const user = await this.userService.create(email, hashedPassword);
    return { id: user.id, email: user.email };
  }

  async login(email: string, password: string, res: Response) {
    const user = await attempt<User>(() => this.userService.findByEmail(email))
      .expect(NotFoundException)
      .thenThrow(new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.'))
      .elseThrow(new InternalServerErrorException());

    // eslint-disable-next-line
    const isMatch = (await bcrypt.compare(password, user.password)) as boolean;
    if (!isMatch) throw new UnauthorizedException('비밀번호가 일치하지 않습니다');

    // 액세스 토큰 발급
    const accessToken = await this.jwtProvider.generateAccessToken({ sub: user.id, email: user.email });

    // 리프레시 토큰 발급
    const refreshToken = await this.jwtProvider.generateRefreshToken({ sub: user.id });

    // 리프레시 토큰을 쿠키에 저장
    cookieUtil.setCookie(
      res,
      { key: 'refreshToken', value: refreshToken },
      { maxAge: this.config.get('JWT_REFRESH_EXPIRES_IN')! },
    );

    return { accessToken };
  }

  async logout(refreshToken: string) {
    const payload = await this.jwtProvider.verify(refreshToken);
    const user = await this.userService.findById(payload.sub);
    if (!user) throw new UnauthorizedException('사용자를 찾을 수 없습니다');

    // 리프레시 토큰을 블랙 리스트에 추가
    this.blacklist.add(refreshToken);

    return { message: '로그아웃 성공' };
  }

  isBlacklisted(token: string): boolean {
    return this.blacklist.has(token);
  }

  async refresh(refreshToken: string, res: Response) {
    if (this.isBlacklisted(refreshToken)) {
      throw new UnauthorizedException('세션이 만료되었습니다. 다시 로그인해주세요.');
    }

    const payload = await this.jwtProvider.verify(refreshToken);
    const user = await this.userService.findById(payload.sub);
    if (!user) throw new UnauthorizedException('사용자를 찾을 수 없습니다');

    // 액세스 토큰 발급
    const accessToken = await this.jwtProvider.generateAccessToken({ sub: user.id, email: user.email });

    // 리프레시 토큰 갱신
    const newRefreshToken = this.jwtProvider.shouldRefreshToken(refreshToken)
      ? await this.jwtProvider.generateRefreshToken({ sub: user.id })
      : refreshToken;

    cookieUtil.setCookie(
      res,
      { key: 'refreshToken', value: newRefreshToken },
      { maxAge: this.config.get('JWT_REFRESH_EXPIRES_IN')! },
    );

    return { accessToken };
  }
}
