import { Module } from '@nestjs/common';
import { ExcecoesService } from './excecoes.service';
import { ExcecoesController } from './excecoes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Excecao } from './entities/excecoes.entity';
import { SalasModule } from '../salas/salas.module';
import { Sala } from '../salas/entities/sala.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Excecao, Sala])],
  controllers: [ExcecoesController],
  providers: [ExcecoesService],
  exports: [ExcecoesService],
})
export class ExcecoesModule {}
