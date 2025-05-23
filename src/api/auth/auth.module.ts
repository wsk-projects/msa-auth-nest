import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './providers/jwt.strategy';
import { TokenProvider } from './providers/token.provider';
import { LoginHistoryService } from './services/login-history.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
      }),
    }),
    ConfigModule,
    UserModule,
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, TokenProvider, AuthService, LoginHistoryService],
})
export class AuthModule {}
