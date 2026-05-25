import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Sala } from '../../salas/entities/sala.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Turno } from '../enums/turno.enum';

@Entity('agendamentos')
export class Agendamento {
  @PrimaryGeneratedColumn()
  id_agendamento: number;

  @Column({ type: 'date' })
  data: Date;

  @Column({ type: 'enum', enum: Turno })
  turno: Turno;

  @ManyToOne(() => Sala, (sala) => sala.agendamentos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_sala' }) 
  sala!: Sala;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;
}