export interface JwtPayload {
  // Required
  sub: number; // Subject; 토큰 주인 (사용자 ID)
  iat: number; // Issued At; 발급 시간
  exp: number; // Expiration Time; 만료 시간

  // Optional
  iss?: string; // Issuer; 토큰 발급자
  aud?: string; // Audience; 토큰 수신자
  nbf?: number; // Not Before; 활성화 시간
  jti?: string; // JWT ID; 토큰 고유 식별자
}
