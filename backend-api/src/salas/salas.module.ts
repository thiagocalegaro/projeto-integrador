import { Module } from '@nestjs/common';
import { SalasController } from './salas.controller';
import { SalasService } from './salas.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sala } from './entities/sala.entity';
import { SalaRecurso } from './entities/sala_recurso.entity';
import { Agendamento } from '../agendamentos/entities/agendamento.entity';
import { Excecao } from '../excecoes/entities/excecoes.entity';
import { ExcecoesModule } from '../excecoes/excecoes.module';

@Module({
  imports: [TypeOrmModule.forFeature([Sala, SalaRecurso, Agendamento, Excecao]), ExcecoesModule],
  controllers: [SalasController],
  providers: [SalasService],
  exports: [SalasService],
})
export class SalasModule {}
