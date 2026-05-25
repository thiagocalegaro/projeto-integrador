import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Agendamento } from '../../agendamentos/entities/agendamento.entity';
import { SalaRecurso } from './sala_recurso.entity';

@Entity('salas')
export class Sala {
  @PrimaryGeneratedColumn() 
  id_sala: number;

  @Column({ unique: true }) 
  codigo: string;

  @Column()
  capacidade: number;

  @Column()
  bloco: string;

  @Column()
  tipo: string;

  @Column({ default: false })
  disponivel_manha: boolean;

  @Column({ default: false })
  disponivel_tarde: boolean;

  @Column({ default: false })
  disponivel_noite: boolean;

  @Column({ default: true })
  ativa: boolean;

  @Column({ nullable: true })
  foto_url?: string;

  @OneToMany(() => Agendamento, (agendamento) => agendamento.sala)
  agendamentos!: Agendamento[];

  @OneToMany(() => SalaRecurso, (salaRecurso) => salaRecurso.sala, {
    cascade: true,
    eager: true,
  })
  salaRecursos: SalaRecurso[];
}