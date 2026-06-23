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
import { Type, Transform } from 'class-transformer';
import { RecursoQuantidadeDto } from './recurso-quantidade.dto';

export class CreateSalaDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toUpperCase() : value)
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