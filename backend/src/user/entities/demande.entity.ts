import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Demande {
  @PrimaryGeneratedColumn('uuid')
  demande_id?: string;

  @ManyToOne(() => User, (user) => user.demandes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  // Informations du formulaire marchand
  @Column({ length: 120 })
  nom_boutique?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column('simple-array', { nullable: true })
  documents?: string[];

  @Column({
    type: 'enum',
    enum: ['en_attente', 'validee', 'rejetee'],
    default: 'en_attente',
  })
  statut?: string;

  // Code envoyé par mail pour consulter la demande (valide 2 jours)
  @Column({ unique: true })
  code_consultation?: string;

  @Column({ type: 'timestamp' })
  code_expire_le!: Date;

  // Vrai une fois que le code a été utilisé pour accéder à la page
  @Column({ default: false })
  code_utilise?: boolean;

  @CreateDateColumn()
  soumis_le?: Date;

  // Renseigné par l'admin lors du traitement
  @Column({ type: 'timestamp', nullable: true })
  traite_le?: Date;
}