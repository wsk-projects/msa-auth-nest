import { UnauthorizedException } from '@nestjs/common';
import { CookieOptions, Request, Response } from 'express';
import { expect } from '../assertion/expect-throw';
import { Cookie } from './types/cookie.interface';

const secureCookieOptoins = {
  path: '/',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
};

export const cookieUtil = {
  setCookie(res: Response, { key, value }: Cookie, cookieOptions: CookieOptions): void {
    res.cookie(key, value, {
      ...secureCookieOptoins,
      ...cookieOptions,
    });
  },

  getCookie(req: Request, key: Cookie['key']): string {
    const cookie = (req.cookies as Record<string, string>)[key];
    expect(cookie != null).elseThrow(new UnauthorizedException());

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
