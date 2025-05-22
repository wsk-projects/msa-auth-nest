import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findByEmail(email: string): Promise<User> {
    const user = this.users.find((user) => user.email === email);
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다');
    return user;
  }

  async findById(id: number): Promise<User> {
    const user = this.users.find((user) => user.id === id);
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다');
    return user;
  }
}
