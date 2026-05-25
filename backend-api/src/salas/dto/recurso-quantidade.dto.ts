import { IsInt, Min } from 'class-validator';

export class RecursoQuantidadeDto {
  @IsInt()
  id: number;

  @IsInt()
  @Min(1)
  quantidade: number;
}