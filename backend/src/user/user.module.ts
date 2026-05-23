import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { ClientProfil } from './entities/client-profil.entity';
import { MarchandProfil } from './entities/marchand-profil.entity';
import { OtpVerification } from './entities/otp-verification.entity';
import { Demande } from './entities/demande.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      ClientProfil,
      MarchandProfil,
      OtpVerification,
      Demande,
    ]),
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}