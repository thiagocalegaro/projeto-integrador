import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Sala } from '../../salas/entities/sala.entity';
import { TipoExcecao } from '../enums/tipo-excecao.enum';

@Entity('excecoes')
export class Excecao {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', nullable: false, name: 'data_inicio' })
  dataInicio: Date;

  @Column({ type: 'date', nullable: false, name: 'data_fim' })
  dataFim: Date;

  @Column({ type: 'enum', enum: TipoExcecao, nullable: true })
  tipo: TipoExcecao;

  @Column({ type: 'varchar', length: 100, nullable: false })
  motivo: string;

  @Column({ type: 'varchar', length: 50, nullable: true }) 
  bloco: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Sala, { onDelete: 'CASCADE', nullable: true }) 
  @JoinColumn({ name: 'id_sala' }) 
  sala: Sala;
}