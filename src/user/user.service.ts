import { Injectable } from '@nestjs/common';
import { User } from 'src/user/types/user.entity';

@Injectable()
export class UserService {
  private users: User[] = [];
  private idCounter = 1;

  async create(email: string, password: string): Promise<User> {
    const user = { id: this.idCounter++, email, password };
    this.users.push(user);
    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email === email);
  }

  async findById(id: number): Promise<User | undefined> {
    return this.users.find((user) => user.id === id);
  }
}
