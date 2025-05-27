import { ConflictException, Injectable } from '@nestjs/common';
import { UserAuth } from '@prisma/client';
import { UserAuthRepository } from '../../../../db/repositories/user-auth.repository';
import { SignupTransaction } from '../../../../db/transactions/signup.transaction';
import { UserOAuthRepository } from 'src/db/repositories/user-oauth.repository';

@Injectable()
export class SignupService {
  constructor(
    private readonly userAuthRepository: UserAuthRepository,
    private readonly userOAuthRepository: UserOAuthRepository,
    private readonly tx: SignupTransaction,
  ) {}

  async checkEmailExists(email: string): Promise<{ exists: boolean }> {
    const userAuth = await this.userAuthRepository.findByEmail(email);
    if (userAuth) return { exists: true };
    return { exists: false };
  }

  async signup(email: string, password: string): Promise<void> {
    await this.tx.signup(email, password);
  }

  async findById(id: number): Promise<UserAuth | null> {
    return this.userAuthRepository.findById(id);
  }

  async findByEmail(email: string): Promise<UserAuth | null> {
    return this.userAuthRepository.findByEmail(email);
  }
}
