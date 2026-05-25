import { PartialType } from '@nestjs/mapped-types';
import { CreateSalaDto } from './create-sala.dto';
import { RecursoQuantidadeDto } from './recurso-quantidade.dto';
export class UpdateSalaDto extends PartialType(CreateSalaDto) {
  capacidade?: number;
  bloco?: string;
  ativa?: boolean;
  disponivel_manha?: boolean;
  disponivel_tarde?: boolean;
  disponivel_noite?: boolean;
  foto_url?: string;
  tipo?: string;
  codigo?: string;
  recursos?: RecursoQuantidadeDto[];  
}
