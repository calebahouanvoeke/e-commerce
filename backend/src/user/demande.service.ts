import {
  Injectable,
  NotFoundException,
  BadRequestException,
  GoneException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { Demande } from './entities/demande.entity';
import { User } from './entities/user.entity';

@Injectable()
export class DemandeService {
  constructor(
    @InjectRepository(Demande)
    private repo: Repository<Demande>,
  ) {}

  // Soumission du formulaire marchand — génère le code consultation (2 jours)
  async creer(
    user: User,
    data: Pick<Demande, 'nom_boutique' | 'description' | 'documents'>,
  ): Promise<Demande> {
    const code_consultation = randomBytes(16).toString('hex');
    const code_expire_le = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // +2 jours

    const demande = this.repo.create({
      ...data,
      user,
      code_consultation,
      code_expire_le,
    });
    return await this.repo.save(demande);
  }

  // Consultation publique via le code reçu par mail
  async consulterParCode(code_consultation: string): Promise<Demande> {
    const demande = await this.repo.findOne({
      where: { code_consultation },
      relations: ['user'],
    });

    if (!demande) throw new NotFoundException('Demande introuvable');
    if (demande.code_expire_le < new Date()) {
      throw new GoneException('Le lien de consultation a expiré');
    }

    return demande;
  }

  findById(demande_id: string): Promise<Demande | null> {
    return this.repo.findOne({ where: { demande_id }, relations: ['user'] });
  }

  // Appelé par l'admin pour valider ou rejeter
  async traiter(
    demande_id: string,
    statut: 'validee' | 'rejetee',
  ): Promise<Demande> {
    const demande = await this.findById(demande_id);
    if (!demande) throw new NotFoundException('Demande introuvable');
    if (demande.statut !== 'en_attente') {
      throw new BadRequestException('Cette demande a déjà été traitée');
    }

    demande.statut = statut;
    demande.traite_le = new Date();
    return await this.repo.save(demande);
  }
}