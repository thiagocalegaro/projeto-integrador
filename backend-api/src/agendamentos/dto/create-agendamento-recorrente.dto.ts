import { IsDate, IsEnum, IsNotEmpty, IsInt, IsString, Min } from 'class-validator';
import { Turno } from '../enums/turno.enum';
import { Type } from 'class-transformer';

export class CreateAgendamentoRecorrenteDto {
  @IsInt()
  @IsNotEmpty()
  id_sala: number;

  @IsInt()
  @IsNotEmpty()
  id_usuario: number;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  data: Date; 

  @IsEnum(Turno)
  @IsNotEmpty()
  turno: Turno;

  @IsInt()
  @Min(2)
  numero_de_semanas: number;
}