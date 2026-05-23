import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { ClientProfilService } from '../user/client-profil.service';
import { OtpVerificationService } from '../user/otp-verification.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private clientProfilService: ClientProfilService,
    private otpService: OtpVerificationService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ message: string }> {
    const { nom, prenom, email, telephone, mot_de_passe } = dto;

    const mot_de_passe_hash = await bcrypt.hash(mot_de_passe, 10);

    // 1. Créer le compte (statut: inactif, role: client par défaut)
    const user = await this.userService.create({ email, mot_de_passe_hash });

    // 2. Créer le profil client avec les données du formulaire
    await this.clientProfilService.create(user, { nom, prenom, telephone });

    // 3. Générer et envoyer l'OTP par mail
    const otp = await this.otpService.generer(user);

    // TODO: MailService.envoyerOtp(user.email, otp.code)

    return {
      message: 'Compte créé. Vérifiez votre boîte mail pour activer votre compte.',
    };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<{ message: string }> {
    const { email, code } = dto;

    const user = await this.userService.findByEmail(email);
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    if (user.statut === 'actif') {
      throw new BadRequestException('Ce compte est déjà activé');
    }

    // Vérifie le code et le marque comme utilisé
    await this.otpService.verifier(user.user_id, code);

    // Active le compte
    await this.userService.activate(user.user_id);

    return { message: 'Compte activé. Vous pouvez maintenant vous connecter.' };
  }

  async login(dto: LoginDto): Promise<{ access_token: string; role: string }> {
    const { email, mot_de_passe } = dto;

    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Identifiants incorrects');

    if (user.statut === 'inactif') {
      throw new UnauthorizedException('Compte non activé. Vérifiez votre mail.');
    }

    if (user.statut === 'suspendu' || user.statut === 'banni') {
      throw new UnauthorizedException('Compte suspendu ou banni');
    }

    const valide = await bcrypt.compare(mot_de_passe, user.mot_de_passe_hash);
    if (!valide) throw new UnauthorizedException('Identifiants incorrects');

    const payload = { sub: user.user_id, email: user.email, role: user.role };
    const access_token = await this.jwtService.signAsync(payload);

    return { access_token, role: user.role };
  }
}