import { PartialType } from '@nestjs/mapped-types';
import { CreateExcecaoDto } from './create-excecao.dto';
import { TipoExcecao } from '../enums/tipo-excecao.enum';

export class UpdateExcecaoDto extends PartialType(CreateExcecaoDto) {
  id_sala?: number;
  codigo_sala?: string;
  inicio?: string;
  fim?: string;
  motivo?: string;
  tipo?: TipoExcecao;
}
