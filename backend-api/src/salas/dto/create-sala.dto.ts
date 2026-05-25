import { 
  IsString, 
  IsNotEmpty, 
  IsInt, 
  Min, 
  IsBoolean, 
  IsOptional,
  IsArray,       
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { RecursoQuantidadeDto } from './recurso-quantidade.dto';

export class CreateSalaDto {
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsString()
  @IsOptional()
  bloco?: string;

  @IsInt()
  @Min(1)
  capacidade: number;

  @IsString()
  @IsOptional()
  foto_url?: string;

  @IsBoolean()
  @IsNotEmpty()
  disponivel_manha: boolean;

  @IsBoolean()
  @IsNotEmpty()
  disponivel_tarde: boolean;

  @IsBoolean()
  @IsNotEmpty()
  disponivel_noite: boolean;

  @IsBoolean()
  @IsNotEmpty()
  ativa: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true }) 
  @Type(() => RecursoQuantidadeDto) 
  recursos: RecursoQuantidadeDto[];
}