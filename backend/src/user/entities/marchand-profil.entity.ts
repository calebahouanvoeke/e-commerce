import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class MarchandProfil {
  @PrimaryGeneratedColumn('uuid')
  profil_id?: string;

  // Créé quand l'admin valide la Demande, pas à l'inscription
  @OneToOne(() => User, (user) => user.marchand_profil, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ length: 120 })
  nom_boutique?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column('simple-array', { nullable: true })
  documents?: string[];

  @CreateDateColumn()
  valide_le?: Date;
}