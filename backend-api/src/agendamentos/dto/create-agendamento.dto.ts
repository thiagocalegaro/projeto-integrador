import { IsString, IsDateString, IsEnum, IsInt } from 'class-validator';
import { Turno } from '../enums/turno.enum';

export class CreateAgendamentoDto {
  @IsInt()
  id_usuario: number;

  @IsInt()
  id_sala: number;

  @IsDateString()
  data: string;

  @IsEnum(Turno)
  turno: Turno;
}