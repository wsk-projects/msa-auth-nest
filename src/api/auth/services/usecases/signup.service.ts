import { Injectable } from '@nestjs/common';
import { UserAuth } from '@prisma/client';
import { UserAuthRepository } from '../../../../db/repositories/user-auth.repository';
import { SignupTransaction } from '../../../../db/transactions/signup.transaction';

@Injectable()
export class SignupService {
  constructor(
    private readonly userAuthRepository: UserAuthRepository,
    private readonly tx: SignupTransaction,
  ) {}

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
