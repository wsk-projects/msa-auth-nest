import * as jwt from 'jsonwebtoken';
import { AccessPayload } from 'src/utils/jwt/types/access-payload.interface';
import { JwtPayload } from 'src/utils/jwt/types/jwt-payload.interface';
import { RefreshPayload } from 'src/utils/jwt/types/refresh-payload.interface';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN!;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN!;
const JWT_REFRESH_EXPIRES_IN_THRESHOLD = process.env.JWT_REFRESH_EXPIRES_IN_THRESHOLD;

export const jwtUtil = {
  generateAccessToken(payload: AccessPayload): string {
    const token = jwt.sign(
      {
        sub: payload.sub,
        email: payload.email,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );

    if (process.env.NODE_ENV === 'development') {
      const decoded = jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;
      console.log(`✅ AT Payload: { sub: ${decoded.sub}, expires: ${new Date(decoded.exp! * 1000).toISOString()}}`);
    }

    return token;
  },

  generateRefreshToken(payload: RefreshPayload): string {
    const token = jwt.sign(
      {
        sub: payload.sub,
      },
      JWT_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN },
    );

    if (process.env.NODE_ENV === 'development') {
      const decoded = jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;
      console.log(`✅ RT Payload: { sub: ${decoded.sub}, expires: ${new Date(decoded.exp! * 1000).toISOString()}}`);
    }

    return token;
  },

  updateRefreshToken(token: string): string {
    if (jwtUtil.shouldRefreshToken(token)) {
      const payload = jwt.verify(token, JWT_SECRET) as unknown as RefreshPayload;
      return jwtUtil.generateRefreshToken({ sub: payload.sub });
    }
    return token;
  },

  shouldRefreshToken(token: string): boolean {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as unknown as RefreshPayload;
      if (!decoded || !decoded.exp) return true;

      const expiry = decoded.exp * 1000;
      const current = Date.now();
      const timeToExpiry = expiry - current;

      return timeToExpiry < Number(JWT_REFRESH_EXPIRES_IN) * Number(JWT_REFRESH_EXPIRES_IN_THRESHOLD);
    } catch {
      return true;
    }
  },

  verify(token: string): JwtPayload {
    return jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;
  },
};
