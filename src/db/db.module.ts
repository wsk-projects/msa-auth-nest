import { Global, Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/services/prisma.module';
import { LoginHistoryRepository } from './repositories/login-history.repository';
import { UserAuthRepository } from './repositories/user-auth.repository';
import { SignupTransaction } from './transactions/signup.transaction';
import { UserOAuthRepository } from './repositories/user-oauth.repository';
import { OAuthTransaction } from './transactions/oauth.transaction';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [UserAuthRepository, UserOAuthRepository, LoginHistoryRepository, SignupTransaction, OAuthTransaction],
  exports: [UserAuthRepository, UserOAuthRepository, LoginHistoryRepository, SignupTransaction, OAuthTransaction],
})
export class DbModule {}
