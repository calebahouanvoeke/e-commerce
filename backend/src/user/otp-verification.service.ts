import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OtpVerification } from './entities/otp-verification.entity';
import { User } from './entities/user.entity';

@Injectable()
export class OtpVerificationService {
  constructor(
    @InjectRepository(OtpVerification)
    private repo: Repository<OtpVerification>,
  ) {}

  // Génère un code à 6 chiffres et le persiste (expire dans 10 min)
  async generer(user: User): Promise<OtpVerification> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expire_le = new Date(Date.now() + 10 * 60 * 1000); // +10 minutes

    const otp = this.repo.create({ user, code, expire_le });
    return await this.repo.save(otp);
  }

  // Vérifie le code soumis par l'utilisateur
  async verifier(user_id: string, code: string): Promise<OtpVerification> {
    const otp = await this.repo.findOne({
      where: { user: { user_id }, code, utilise: false },
      relations: ['user'],
    });

    if (!otp) throw new NotFoundException('Code OTP invalide');
    if (otp.expire_le < new Date()) throw new BadRequestException('Code OTP expiré');

    otp.utilise = true;
    return await this.repo.save(otp);
  }
}