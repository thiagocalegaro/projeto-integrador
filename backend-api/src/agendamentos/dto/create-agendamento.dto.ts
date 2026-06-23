import { IsNotEmpty, IsInt, IsString, IsDateString, IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class CreateAgendamentoDto {
  @IsInt()
  @IsNotEmpty()
  id_sala: number;

  @IsString()
  @IsNotEmpty()
  motivo: string;

  @IsDateString()
  @IsNotEmpty()
  data: string;

  @IsNumber({}, { message: 'O ID do usuário deve ser um número válido.' })
  @IsOptional() 
  id_usuario?: number;

  @IsBoolean()
  turno_manha: boolean;

  @IsBoolean()
  turno_tarde: boolean;

  @IsBoolean()
  turno_noite: boolean;
}