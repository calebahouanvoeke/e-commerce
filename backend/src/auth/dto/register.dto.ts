import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsMobilePhone } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Dupont' })
  @IsString()
  nom!: string;

  @ApiProperty({ example: 'Jean' })
  @IsString()
  prenom!: string;

  @ApiProperty({ example: 'jean.dupont@email.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '+33612345678' })
  @IsMobilePhone()
  telephone!: string;

  @ApiProperty({ example: 'MotDePasse123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  mot_de_passe!: string;
}