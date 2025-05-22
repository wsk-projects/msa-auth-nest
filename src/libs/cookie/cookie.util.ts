import { UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';

interface Cookie {
  key: string;
  value: string;
}

interface CookieOptions {
  maxAge: number;
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export const cookieUtil = {
  setCookie(
    res: Response,
    { key, value }: Cookie,
    {
      maxAge,
      path = '/',
      httpOnly = true,
      secure = process.env.NODE_ENV === 'production',
      sameSite = 'strict',
    }: CookieOptions,
  ): void {
    res.cookie(key, value, {
      maxAge,
      path,
      httpOnly,
      secure,
      sameSite,
    });
  },

  getCookie(req: Request, key: Cookie['key']): string {
    const cookie = (req.cookies as Record<string, string>)[key];

    if (cookie == null) {
      throw new UnauthorizedException(`[ ${key} ] 쿠키를 찾을 수 없습니다.`);
    }

    return cookie;
  },

  getAllCookies(req: Request): Cookie[] {
    return Object.entries(req.cookies as Record<string, string>).map(([key, value]) => ({
      key,
      value,
    }));
  },

  hasCookie(req: Request, key: Cookie['key']): boolean {
    return key in req.cookies;
  },

  deleteCookie(res: Response, key: Cookie['key']): void {
    res.clearCookie(key);
  },
};
