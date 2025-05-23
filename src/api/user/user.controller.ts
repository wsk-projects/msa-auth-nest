import { Controller, Get, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { UserExistsDto } from './dto/response/user-exists.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('exists')
  async checkEmail(@Query('email') email: string): Promise<UserExistsDto> {
    return { exists: await this.userService.checkEmailExists(email) };
  }
}
