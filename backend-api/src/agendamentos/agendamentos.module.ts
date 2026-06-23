import { Module } from '@nestjs/common';
import { AgendamentosService } from './agendamentos.service';
import { AgendamentosController } from './agendamentos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agendamento } from './entities/agendamento.entity';
import { Excecao } from '../excecoes/entities/excecoes.entity';
import { Sala } from '../salas/entities/sala.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([Agendamento, Sala, Excecao]),],
  controllers: [AgendamentosController],
  providers: [AgendamentosService],
})
export class AgendamentosModule {}
