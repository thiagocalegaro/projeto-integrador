import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, LessThanOrEqual, MoreThanOrEqual, Not } from 'typeorm';
import { Agendamento } from './entities/agendamento.entity';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { Sala } from '../salas/entities/sala.entity';
import { Excecao } from '../excecoes/entities/excecoes.entity';
import { TipoExcecao } from '../excecoes/enums/tipo-excecao.enum';
import { UpdateAgendamentoDto } from './dto/update-agendamento.dto';

@Injectable()
export class AgendamentosService {
  constructor(
    @InjectRepository(Agendamento)
    private readonly agendamentoRepository: Repository<Agendamento>,
    @InjectRepository(Sala)
    private readonly salaRepository: Repository<Sala>,
    @InjectRepository(Excecao)
    private readonly excecoesRepository: Repository<Excecao>,
  ) {}

  async create(dto: CreateAgendamentoDto, idUsuarioLogado: number): Promise<Agendamento> {
    const { data, id_sala } = dto;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataReserva = new Date(data + 'T00:00:00');
    dataReserva.setHours(0, 0, 0, 0);

    if (dataReserva.getTime() < hoje.getTime()) {
      throw new BadRequestException('Não é permitido realizar agendamentos em datas passadas.');
    }
    if (!dto.turno_manha && !dto.turno_tarde && !dto.turno_noite) {
      throw new BadRequestException('Você precisa selecionar ao menos um turno para o agendamento.');
    }

    const dataAgendamento = dataReserva;

    const sala = await this.salaRepository.findOne({ where: { id_sala: dto.id_sala } });
    if (!sala) {
      throw new NotFoundException('Sala não encontrada.');
    }
    if (!sala.ativa) {
      throw new BadRequestException('Não é possível agendar uma sala desativada.');
    }

    if (dto.turno_manha && !sala.disponivel_manha) throw new BadRequestException('Esta sala não funciona no turno da manhã.');
    if (dto.turno_tarde && !sala.disponivel_tarde) throw new BadRequestException('Esta sala não funciona no turno da tarde.');
    if (dto.turno_noite && !sala.disponivel_noite) throw new BadRequestException('Esta sala não funciona no turno da noite.');

    const bloqueioAtivo = await this.excecoesRepository.findOne({
      where: [
        { 
          sala: { id_sala: sala.id_sala }, 
          tipo: TipoExcecao.Bloqueio, 
          dataInicio: LessThanOrEqual(dataAgendamento), 
          dataFim: MoreThanOrEqual(dataAgendamento) 
        },
        { 
          bloco: sala.bloco, 
          tipo: TipoExcecao.Bloqueio, 
          dataInicio: LessThanOrEqual(dataAgendamento), 
          dataFim: MoreThanOrEqual(dataAgendamento) 
        },
        { 
          sala: IsNull(), 
          bloco: IsNull(), 
          tipo: TipoExcecao.Bloqueio, 
          dataInicio: LessThanOrEqual(dataAgendamento), 
          dataFim: MoreThanOrEqual(dataAgendamento) 
        }
      ]
    });

    if (bloqueioAtivo) {
      throw new ConflictException(`A sala está indisponível nesta data devido ao bloqueio: ${bloqueioAtivo.motivo}`);
    }

    const agendamentosDoDia = await this.agendamentoRepository.find({
      where: {
        sala: { id_sala: sala.id_sala },
        data: dataAgendamento
      }
    });

    for (const agendamento of agendamentosDoDia) {
      if (dto.turno_manha && agendamento.turno_manha) throw new ConflictException('O turno da manhã já está ocupado nesta data.');
      if (dto.turno_tarde && agendamento.turno_tarde) throw new ConflictException('O turno da tarde já está ocupado nesta data.');
      if (dto.turno_noite && agendamento.turno_noite) throw new ConflictException('O turno da noite já está ocupado nesta data.');
    }

    const novoAgendamento = this.agendamentoRepository.create({
      data: dataAgendamento,
      turno_manha: dto.turno_manha ?? false,
      turno_tarde: dto.turno_tarde ?? false,
      turno_noite: dto.turno_noite ?? false,
      motivo: dto.motivo,
      sala: sala,
      usuario: { id: dto.id_usuario || idUsuarioLogado } as any,
    });

    return await this.agendamentoRepository.save(novoAgendamento);
  }

  async findAll(): Promise<Agendamento[]> {
    return this.agendamentoRepository.find({
      relations: ['sala', 'usuario'],
      order: { data: 'ASC' },
    });
  }

  async remove(id: number): Promise<void> {
    const resultado = await this.agendamentoRepository.delete(id);
    if (resultado.affected === 0) {
      throw new NotFoundException('Agendamento não encontrado.');
    }
  }

  async update(id: number, dto: UpdateAgendamentoDto): Promise<Agendamento> {
  const agendamento = await this.agendamentoRepository.findOne({ 
    where: { id_agendamento: id },
    relations: ['sala'] 
  });
  if (!agendamento) {
    throw new NotFoundException('Agendamento não encontrado.');
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataReserva = new Date(dto.data + 'T00:00:00');
  dataReserva.setHours(0, 0, 0, 0);

  if (dataReserva.getTime() < hoje.getTime()) {
    throw new BadRequestException('Não é permitido atualizar agendamentos para datas passadas.');
  }
  if (!dto.turno_manha && !dto.turno_tarde && !dto.turno_noite) {
    throw new BadRequestException('Você precisa selecionar ao menos um turno.');
  }

  const sala = await this.salaRepository.findOne({ where: { id_sala: dto.id_sala } });
  if (!sala) throw new NotFoundException('Sala não encontrada.');
  if (!sala.ativa) throw new BadRequestException('Não é possível agendar uma sala desativada.');

  if (dto.turno_manha && !sala.disponivel_manha) throw new BadRequestException('Esta sala não funciona pela manhã.');
  if (dto.turno_tarde && !sala.disponivel_tarde) throw new BadRequestException('Esta sala não funciona pela tarde.');
  if (dto.turno_noite && !sala.disponivel_noite) throw new BadRequestException('Esta sala não funciona pela noite.');

  const bloqueioAtivo = await this.excecoesRepository.findOne({
    where: [
      { sala: { id_sala: sala.id_sala }, tipo: TipoExcecao.Bloqueio, dataInicio: LessThanOrEqual(dataReserva), dataFim: MoreThanOrEqual(dataReserva) },
      { bloco: sala.bloco, tipo: TipoExcecao.Bloqueio, dataInicio: LessThanOrEqual(dataReserva), dataFim: MoreThanOrEqual(dataReserva) },
      { sala: IsNull(), bloco: IsNull(), tipo: TipoExcecao.Bloqueio, dataInicio: LessThanOrEqual(dataReserva), dataFim: MoreThanOrEqual(dataReserva) }
    ]
  });
  if (bloqueioAtivo) {
    throw new ConflictException(`A sala está bloqueada neste período: ${bloqueioAtivo.motivo}`);
  }

  const agendamentosDoDia = await this.agendamentoRepository.find({
      where: {
        sala: { id_sala: sala.id_sala },
        data: dataReserva,
        id_agendamento: Not(id)
      }
    });

  for (const item of agendamentosDoDia) {
    if (dto.turno_manha && item.turno_manha) throw new ConflictException('O turno da manhã já está ocupado nesta data.');
    if (dto.turno_tarde && item.turno_tarde) throw new ConflictException('O turno da tarde já está ocupado nesta data.');
    if (dto.turno_noite && item.turno_noite) throw new ConflictException('O turno da noite já está ocupado nesta data.');
  }

  agendamento.data = dataReserva;
  agendamento.motivo = dto.motivo ?? '';
  agendamento.turno_manha = dto.turno_manha ?? false;
  agendamento.turno_tarde = dto.turno_tarde ?? false;
  agendamento.turno_noite = dto.turno_noite ?? false;
  agendamento.sala = sala;
  
  if (dto.id_usuario) {
    agendamento.usuario = { id: dto.id_usuario } as any;
  }

  return await this.agendamentoRepository.save(agendamento);
}
}