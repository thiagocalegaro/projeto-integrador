import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateExcecaoDto, EscopoExcecao } from './dto/create-excecao.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Excecao } from './entities/excecoes.entity';
import { Sala } from '../salas/entities/sala.entity';

@Injectable()
export class ExcecoesService {
  constructor(
    @InjectRepository(Excecao)
    private readonly excecoesRepository: Repository<Excecao>,
    @InjectRepository(Sala)
    private readonly salaRepository: Repository<Sala>,
  ) {}

 async create(dto: CreateExcecaoDto): Promise<Excecao | Excecao[]> {
  const inicioFormatado = new Date(dto.data_inicio + 'T00:00:00');
  const fimFormatada = new Date(dto.data_fim + 'T00:00:00');

  if (inicioFormatado.getTime() > fimFormatada.getTime()) {
    throw new BadRequestException('A data de término não pode ser anterior à data de início.');
  }

  if (dto.escopo === EscopoExcecao.TODAS) {
    const novaExcecao = this.excecoesRepository.create({
      dataInicio: inicioFormatado,
      dataFim: fimFormatada,
      motivo: dto.motivo,
      tipo: dto.tipo,
      sala: undefined,
      bloco: undefined,
    });
    return await this.excecoesRepository.save(novaExcecao);
  }

  if (dto.escopo === EscopoExcecao.SALA_UNICA) {
    const sala = await this.salaRepository.findOne({ where: { id_sala: dto.id_sala } });
    if (!sala) throw new NotFoundException('Sala não encontrada.');

    const novaExcecao = this.excecoesRepository.create({
      dataInicio: inicioFormatado,
      dataFim: fimFormatada,
      motivo: dto.motivo,
      tipo: dto.tipo,
      sala: sala,
      bloco: undefined,
    });
    return await this.excecoesRepository.save(novaExcecao);
  }

  if (dto.escopo === EscopoExcecao.BLOCO) {
    const salasDoBloco = await this.salaRepository.find({ where: { bloco: dto.bloco } });
    
    if (salasDoBloco.length === 0) {
      throw new NotFoundException(`Nenhuma sala encontrada para o bloco '${dto.bloco}'.`);
    }

    const excecoesCriadas: Excecao[] = [];
    
    for (const sala of salasDoBloco) {
      const novaExcecao = this.excecoesRepository.create({
        dataInicio: inicioFormatado,
        dataFim: fimFormatada,
        motivo: dto.motivo,
        tipo: dto.tipo,
        sala: sala,
        bloco: dto.bloco,
      });
      
      const salva = await this.excecoesRepository.save(novaExcecao);
      excecoesCriadas.push(salva);
    }
    
    return excecoesCriadas;
  }

  throw new BadRequestException('Escopo de exceção inválido ou não informado.');
}

  async findAll(): Promise<Excecao[]> {
    return this.excecoesRepository.find({ relations: ['sala'] });
  }

  async remove(id: number): Promise<void> {
    await this.excecoesRepository.delete(id);
  }
}