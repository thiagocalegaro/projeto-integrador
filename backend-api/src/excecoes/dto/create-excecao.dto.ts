import { IsNotEmpty, IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { TipoExcecao } from '../enums/tipo-excecao.enum';
import { ValidateIf, IsNumber } from 'class-validator';

export enum EscopoExcecao {
  SALA_UNICA = 'SALA_UNICA',
  BLOCO = 'BLOCO',
  TODAS = 'TODAS',
}

export class CreateExcecaoDto {
  @IsDateString({}, { message: 'A data deve ser um formato válido (AAAA-MM-DD)' })
  @IsNotEmpty()
  data_inicio: string;

  @IsDateString({}, { message: 'A data de fim deve ser um formato válido (AAAA-MM-DD)' })
  @IsNotEmpty()
  data_fim: string;

  @IsString()
  @IsNotEmpty()
  motivo: string;

  @IsEnum(TipoExcecao, { message: 'O tipo deve ser BLOQUEIO ou EXTRA' })
  @IsOptional()
  tipo: TipoExcecao;

  @IsEnum(EscopoExcecao)
  @IsNotEmpty()
  escopo: EscopoExcecao;

  @ValidateIf((o) => o.escopo === EscopoExcecao.SALA_UNICA)
  @IsNumber()
  @IsNotEmpty()
  id_sala?: number;

  @ValidateIf((o) => o.escopo === EscopoExcecao.BLOCO)
  @IsString()
  @IsNotEmpty()
  bloco?: string;
}