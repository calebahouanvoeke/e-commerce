import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';
import { ClientProfilService } from '../user/client-profil.service';
import { OtpVerificationService } from '../user/otp-verification.service';
import { User } from '../user/entities/user.entity';
import { ClientProfil } from '../user/entities/client-profil.entity';
import { MarchandProfil } from '../user/entities/marchand-profil.entity';
import { OtpVerification } from '../user/entities/otp-verification.entity';
import { Demande } from '../user/entities/demande.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      ClientProfil,
      MarchandProfil,
      OtpVerification,
      Demande,
    ]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    ClientProfilService,
    OtpVerificationService,
  ],
})
export class AuthModule {}