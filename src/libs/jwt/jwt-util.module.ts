import { Module } from '@nestjs/common';
import { JwtUtil } from './jwt.util';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [JwtModule.register({}), ConfigModule],
  providers: [JwtUtil],
  exports: [JwtUtil],
})
export class JwtUtilModule {}
