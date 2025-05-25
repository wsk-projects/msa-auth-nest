import { Global, Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/services/prisma.module';
import { LoginHistoryRepository } from './repositories/login-history.repository';
import { UserAuthRepository } from './repositories/user-auth.repository';
import { SignupTransaction } from './transactions/signup.transaction';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [SignupTransaction, UserAuthRepository, LoginHistoryRepository],
  exports: [SignupTransaction, UserAuthRepository, LoginHistoryRepository],
})
export class DbModule {}
