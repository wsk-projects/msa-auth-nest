import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({
    example: 'user@example.com',
    description: '사용자 이메일 (최대 50자)',
  })
  @IsEmail()
  @MaxLength(50)
  email: string;

  @ApiProperty({
    example: 'password123!',
    description: '사용자 비밀번호 (최소 8자, 최대 20자)',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  password: string;
}
