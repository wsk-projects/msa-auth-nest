import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/common/services/prisma.service';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from '../../libs/passport/jwt.strategy';
import { LoginService } from './services/login.service';
import { SignupService } from './services/signup.service';
import { TokenService } from './services/token.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
      }),
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, PrismaService, AuthService, TokenService, SignupService, LoginService],
})
export class AuthModule {}
