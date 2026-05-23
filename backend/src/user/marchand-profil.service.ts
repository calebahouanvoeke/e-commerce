import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarchandProfil } from './entities/marchand-profil.entity';
import { User } from './entities/user.entity';

@Injectable()
export class MarchandProfilService {
  constructor(
    @InjectRepository(MarchandProfil)
    private repo: Repository<MarchandProfil>,
  ) {}

  // Appelé uniquement par l'admin après validation de la Demande
  async create(
    user: User,
    data: Pick<MarchandProfil, 'nom_boutique' | 'description' | 'documents'>,
  ): Promise<MarchandProfil> {
    const profil = this.repo.create({ ...data, user });
    return await this.repo.save(profil);
  }

  async findByUserId(user_id: string): Promise<MarchandProfil> {
    const profil = await this.repo.findOne({
      where: { user: { user_id } },
      relations: ['user'],
    });
    if (!profil) throw new NotFoundException('Profil marchand introuvable');
    return profil;
  }
}