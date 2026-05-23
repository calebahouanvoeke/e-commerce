import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) {}

  async create(data: Pick<User, 'email' | 'mot_de_passe_hash'>): Promise<User> {
    try {
      const user = this.repo.create(data);
      return await this.repo.save(user);
    } catch (e) {
      throw new ConflictException('Email déjà utilisé');
    }
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  findById(user_id: string): Promise<User | null> {
    return this.repo.findOne({ where: { user_id } });
  }

  // Appelé après validation OTP → inactif → actif
  async activate(user_id: string): Promise<void> {
    const user = await this.findById(user_id);
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    user.statut = 'actif';
    await this.repo.save(user);
  }

  // Appelé par l'admin après validation d'une demande marchand
  async promouvoirMarchand(user_id: string): Promise<void> {
    const user = await this.findById(user_id);
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    user.role = 'marchand';
    await this.repo.save(user);
  }

  async updateStatut(
    user_id: string,
    statut: 'actif' | 'suspendu' | 'banni',
  ): Promise<void> {
    const user = await this.findById(user_id);
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    user.statut = statut;
    await this.repo.save(user);
  }
}