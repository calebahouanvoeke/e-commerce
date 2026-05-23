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
export class OtpVerification {
  @PrimaryGeneratedColumn('uuid')
  otp_id?: string;

  @ManyToOne(() => User, (user) => user.otps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ length: 6 })
  code?: string;

  // Détermine l'usage : activation du compte ou autre besoin futur
  @Column({
    type: 'enum',
    enum: ['activation_compte'],
    default: 'activation_compte',
  })
  type?: string;

  @Column({ default: false })
  utilise?: boolean;

  // Expire après N minutes (géré à la création côté service)
  @Column({ type: 'timestamp' })
  expire_le!: Date;

  @CreateDateColumn()
  created_at?: Date;
}