import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { ClientProfil } from './client-profil.entity';
import { OtpVerification } from './otp-verification.entity';
import { Demande } from './demande.entity';
import { MarchandProfil } from './marchand-profil.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  mot_de_passe_hash!: string;

  @Column({
    type: 'enum',
    enum: ['client', 'marchand', 'comptable', 'admin'],
    default: 'client',
  })
  role!: string;

  // inactif par défaut jusqu'à validation OTP
  @Column({
    type: 'enum',
    enum: ['inactif', 'actif', 'suspendu', 'banni'],
    default: 'inactif',
  })
  statut!: string;

  @CreateDateColumn()
  created_at!: Date;

  @OneToOne(() => ClientProfil, (profil) => profil.user)
  client_profil!: ClientProfil;

  @OneToOne(() => MarchandProfil, (profil) => profil.user)
  marchand_profil!: MarchandProfil;

  @OneToMany(() => OtpVerification, (otp) => otp.user)
  otps!: OtpVerification[];

  @OneToMany(() => Demande, (demande) => demande.user)
  demandes!: Demande[];
}