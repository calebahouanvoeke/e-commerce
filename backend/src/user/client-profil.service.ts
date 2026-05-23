import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProfil } from './entities/client-profil.entity';
import { User } from './entities/user.entity';

@Injectable()
export class ClientProfilService {
  constructor(
    @InjectRepository(ClientProfil)
    private repo: Repository<ClientProfil>,
  ) {}

  // Appelé juste après la création du User lors de l'inscription
  async create(
    user: User,
    data: Pick<ClientProfil, 'nom' | 'prenom' | 'telephone'>,
  ): Promise<ClientProfil> {
    try {
      const profil = this.repo.create({ ...data, user });
      return await this.repo.save(profil);
    } catch (e) {
      throw new ConflictException('Téléphone déjà utilisé');
    }
  }

  async findByUserId(user_id: string): Promise<ClientProfil> {
    const profil = await this.repo.findOne({
      where: { user: { user_id } },
      relations: ['user'],
    });
    if (!profil) throw new NotFoundException('Profil client introuvable');
    return profil;
  }
}