import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Role } from '../enums/role.enum';
import { Agendamento } from '../../agendamentos/entities/agendamento.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  nome: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  senha: string;

  @Column({ type: 'enum', enum: Role, default: Role.User, nullable: true })
  tipo: Role;

  @OneToMany(() => Agendamento, (agendamento) => agendamento.usuario)
  agendamentos: Agendamento[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
