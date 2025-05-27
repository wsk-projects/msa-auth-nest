import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/common/services/prisma.service';
import { JwtStrategy } from '../../libs/passport/jwt.strategy';
import { UserModule } from '../user/user.module';
import { AuthController } from './controllers/auth.controller';
import { OAuthController } from './controllers/oauth.controller';
import { SignupController } from './controllers/signup.controller';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/domain/token.service';
import { OAuthService } from './services/oauth.service';
import { GoogleLoginService } from './services/usecases/google-login.service';
import { LoginService } from './services/usecases/login.service';
import { SignupService } from './services/usecases/signup.service';

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
  controllers: [AuthController, OAuthController, SignupController],
  providers: [
    JwtStrategy,
    PrismaService,
    AuthService,
    TokenService,
    SignupService,
    LoginService,
    OAuthService,
    GoogleLoginService,
  ],
})
export class AuthModule {}
