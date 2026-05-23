import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ example: 'jean.dupont@email.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '847291', minLength: 6, maxLength: 6 })
  @IsString()
  @Length(6, 6)
  code!: string;
}