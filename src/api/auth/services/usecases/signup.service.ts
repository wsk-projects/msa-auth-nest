import { Injectable } from '@nestjs/common';
import { UserAuthRepository } from '../../../../db/repositories/user-auth.repository';
import { SignupTransaction } from '../../../../db/transactions/signup.transaction';

@Injectable()
export class SignupService {
  constructor(
    private readonly userAuthRepository: UserAuthRepository,
    private readonly tx: SignupTransaction,
  ) {}

  async signup(email: string, password: string) {
    return this.tx.signup(email, password);
  }

  async findById(id: number) {
    return this.userAuthRepository.findById(id);
  }

  async findByEmail(email: string) {
    return this.userAuthRepository.findByEmail(email);
  }
}
