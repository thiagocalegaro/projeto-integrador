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

  @Column({ type: 'timestamp', nullable: false })
  inicio: Date;

  @Column({ type: 'timestamp', nullable: false })
  fim: Date;

  @Column({ type: 'enum', enum: TipoExcecao, nullable: true })
  tipo: TipoExcecao;

  @Column({ type: 'varchar', length: 100, nullable: false })
  motivo: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Sala, { onDelete: 'CASCADE' }) 
  @JoinColumn({ name: 'id_sala' }) 
  sala: Sala;
}
