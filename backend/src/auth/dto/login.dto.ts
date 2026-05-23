import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'jean.dupont@email.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'MotDePasse123!' })
  @IsString()
  mot_de_passe!: string;
}