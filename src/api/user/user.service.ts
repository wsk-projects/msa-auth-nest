import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from 'src/api/user/entities/user.entity';
import prisma from 'src/libs/prisma/prisma-client';

@Injectable()
export class UserService {
  async create(email: string, password: string): Promise<User> {
    if (await this.checkEmailExists(email)) throw new ConflictException('이미 존재하는 이메일입니다.');

    const user = { email, password };
    const createdUser = (await prisma.user.create({
      data: user,
    })) as User;

    return createdUser;
  }

  async checkEmailExists(email: string): Promise<boolean> {
    if (await prisma.user.findUnique({ where: { email } })) return true;
    return false;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다');
    return user;
  }

  async findById(id: number): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다');
    return user;
  }
}
