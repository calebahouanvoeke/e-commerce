import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';

import { UserService } from '../user/user.service';
import { ClientProfilService } from '../user/client-profil.service';
import { OtpVerificationService } from '../user/otp-verification.service';

import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginDto } from './dto/login.dto';

import { User } from '../user/entities/user.entity';
import { ClientProfil } from '../user/entities/client-profil.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private clientProfilService: ClientProfilService,
    private otpService: OtpVerificationService,
    private jwtService: JwtService,
    private dataSource: DataSource,
  ) {}

  async register(dto: RegisterDto): Promise<{ message: string; user: any }> {
    const { nom, prenom, email, telephone, mot_de_passe } = dto;

    // Vérifier si email existe déjà
    const existingUser = await this.userService.findByEmail(email);

    if (existingUser) {
      throw new BadRequestException('Cet email est déjà utilisé');
    }

    return await this.dataSource.transaction(async (manager) => {
      try {
        // 1. Hash password
        const mot_de_passe_hash = await bcrypt.hash(mot_de_passe, 10);

        // 2. Création USER
        const user = manager.create(User, {
          email,
          mot_de_passe_hash,
          statut: 'inactif',
        });

        await manager.save(user);

        // 3. Création PROFIL
        const profil = manager.create(ClientProfil, {
          nom,
          prenom,
          telephone,
          user,
        });

        await manager.save(profil);

        // 4. Génération OTP
        await this.otpService.generer(user);

        // 5. Nettoyage password
        const { mot_de_passe_hash: _, ...userData } = user;

        return {
          message:
            'Compte créé. Vérifiez votre boîte mail pour activer votre compte.',
          user: {
            ...userData,
            profil,
          },
        };
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Erreur inconnue';

        throw new BadRequestException(
          "Erreur lors de la création du compte : " + message,
        );
        }
    });
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<{ message: string }> {
    const { email, code } = dto;

    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    if (user.statut === 'actif') {
      throw new BadRequestException('Ce compte est déjà activé');
    }

    await this.otpService.verifier(user.user_id, code);

    await this.userService.activate(user.user_id);

    return {
      message: 'Compte activé. Vous pouvez maintenant vous connecter.',
    };
  }

  // =========================
  // LOGIN
  // =========================
  async login(
    dto: LoginDto,
  ): Promise<{ access_token: string; user: any }> {
    const { email, mot_de_passe } = dto;

    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Identifiants incorrects');
    }

    if (user.statut === 'inactif') {
      throw new UnauthorizedException(
        'Compte non activé. Vérifiez votre mail.',
      );
    }

    if (user.statut === 'suspendu' || user.statut === 'banni') {
      throw new UnauthorizedException('Compte suspendu ou banni');
    }

    const valide = await bcrypt.compare(
      mot_de_passe,
      user.mot_de_passe_hash,
    );

    if (!valide) {
      throw new UnauthorizedException('Identifiants incorrects');
    }

    const payload = {
      sub: user.user_id,
      email: user.email,
      role: user.role,
    };

    const access_token = await this.jwtService.signAsync(payload);

    const { mot_de_passe_hash: _, ...userData } = user;

    return {
      access_token,
      user: userData,
    };
  }
}