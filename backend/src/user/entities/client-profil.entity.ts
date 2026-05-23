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
export class ClientProfil {
  @PrimaryGeneratedColumn('uuid')
  profil_id?: string;

  @OneToOne(() => User, (user) => user.client_profil, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ length: 80 })
  nom?: string;

  @Column({ length: 80 })
  prenom?: string;

  @Column({ unique: true })
  telephone?: string;

  @CreateDateColumn()
  created_at?: Date;
}