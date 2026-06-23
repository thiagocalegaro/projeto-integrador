import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Sala } from '../../salas/entities/sala.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('agendamentos')
export class Agendamento {
  @PrimaryGeneratedColumn()
  id_agendamento: number;

  @Column({ type: 'date' }) 
  data: Date;

  @Column({ default: false })
  turno_manha: boolean;

  @Column({ default: false })
  turno_tarde: boolean;

  @Column({ default: false })
  turno_noite: boolean;

  @Column()
  motivo: string;

  @ManyToOne(() => Sala, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_sala' })
  sala: Sala;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;
}