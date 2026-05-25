// src/recursos/entities/sala-recurso.entity.ts

import { Sala } from '../../salas/entities/sala.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Recurso } from '../../recursos/entities/recurso.entity';

@Entity('sala_recursos')
export class SalaRecurso {
  @PrimaryGeneratedColumn()
  id: number; 

  @Column({ type: 'int' })
  quantidade: number;


  @ManyToOne(() => Sala, (sala) => sala.agendamentos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_sala' }) 
  sala!: Sala;

  @ManyToOne(() => Recurso, (recurso) => recurso.salaRecursos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_recurso' })
  recurso: Recurso;
}
