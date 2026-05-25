import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, MoreThanOrEqual } from 'typeorm';
import { addWeeks } from 'date-fns';
import { Agendamento } from './entities/agendamento.entity';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { CreateAgendamentoRecorrenteDto } from './dto/create-agendamento-recorrente.dto';
import { SalasService } from '../salas/salas.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { Turno } from './enums/turno.enum';

@Injectable()
export class AgendamentosService {
  constructor(
    @InjectRepository(Agendamento)
    private readonly agendamentosRepository: Repository<Agendamento>,
    private readonly salasService: SalasService,
    private readonly usuariosService: UsuariosService,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateAgendamentoDto): Promise<Agendamento> {
    // 1. Busca a sala e valida se existe
    const sala = await this.salasService.findOne(dto.id_sala);
    if (!sala) {
      throw new NotFoundException(`Sala com ID ${dto.id_sala} não encontrada.`);
    }

    this.validarFuncionamentoSalaTurno(sala, dto.turno);

    const dataAgendamento = new Date(dto.data);
    const isDisponivel = await this.verificarDisponibilidade(dto.id_sala, dataAgendamento, dto.turno);
    if (!isDisponivel) {
      throw new ConflictException(`A sala já está ocupada neste turno.`);
    }

    const usuario = await this.usuariosService.findOne(dto.id_usuario);
    if (!usuario) {
      throw new NotFoundException(`Usuário com ID ${dto.id_usuario} não encontrado.`);
    }

    const novoAgendamento = this.agendamentosRepository.create({
      data: dataAgendamento,
      turno: dto.turno,
      sala,
      usuario,
    });
    return this.agendamentosRepository.save(novoAgendamento);
  }

  async createRecorrente(dto: CreateAgendamentoRecorrenteDto): Promise<Agendamento[]> {
    const { id_sala, id_usuario, data, turno, numero_de_semanas } = dto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const sala = await this.salasService.findOne(id_sala);
      if (!sala) throw new NotFoundException(`Sala com ID ${id_sala} não encontrada.`);

      const usuario = await this.usuariosService.findOne(id_usuario);
      if (!usuario) throw new NotFoundException(`Usuário com ID ${id_usuario} não encontrado.`);

      this.validarFuncionamentoSalaTurno(sala, turno);

      const agendamentosCriados: Agendamento[] = [];
      const dataInicial = new Date(data);

      for (let i = 0; i < numero_de_semanas; i++) {
        const dataDaSemana = addWeeks(dataInicial, i);

        const conflito = await queryRunner.manager.findOne(Agendamento, {
          where: {
            sala: { id_sala },
            data: dataDaSemana,
            turno: turno,
          },
        });

        if (conflito) {
          throw new ConflictException(
            `A sala já está ocupada no turno solicitado na data ${dataDaSemana.toISOString().split('T')[0]}`
          );
        }

        const novoAgendamento = queryRunner.manager.create(Agendamento, {
          data: dataDaSemana,
          turno: turno,
          sala,
          usuario,
        });

        const agendamentoSalvo = await queryRunner.manager.save(novoAgendamento);
        agendamentosCriados.push(agendamentoSalvo);
      }

      await queryRunner.commitTransaction();
      return agendamentosCriados;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async verificarDisponibilidade(id_sala: number, data: Date, turno: Turno): Promise<boolean> {
    const conflitos = await this.agendamentosRepository.count({
      where: {
        sala: { id_sala },
        data: data,
        turno: turno,
      },
    });
    return conflitos === 0;
  }

  async findAll() {
    return this.agendamentosRepository.find({
      relations: { sala: true, usuario: true }, 
      order: { data: 'DESC' },
    });
  }

  async findMy(userId: number): Promise<Agendamento[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.agendamentosRepository.find({
      where: {
        usuario: { id_usuario: userId } as any, 
        data: MoreThanOrEqual(today),
      },
      relations: { sala: true }, 
      order: {
        data: 'ASC',
        turno: 'ASC',
      },
    });
  }

  async findOne(id: number) {
    const agendamento = await this.agendamentosRepository.findOne({
      where: { id_agendamento: id },
      relations: { sala: true, usuario: true },
    });

    if (!agendamento) {
      throw new NotFoundException(`Agendamento com ID ${id} não encontrado.`);
    }

    return agendamento;
  }

  remove(id: number) {
    return this.agendamentosRepository.delete(id); 
  }

  async findTurnosOcupados(id_sala: number, data: string) {
    const agendamentos = await this.agendamentosRepository.find({
      where: {
        sala: { id_sala },
        data: new Date(data),
      },
      order: { turno: 'ASC' },
    });
    return agendamentos.map((a) => ({
      turno_ocupado: a.turno,
    }));
  }

  private validarFuncionamentoSalaTurno(sala: any, turno: Turno): void {
    if (turno === Turno.MANHA && !sala.disponivel_manha) {
      throw new ConflictException('Esta sala não está disponível no turno da manhã.');
    }
    if (turno === Turno.TARDE && !sala.disponivel_tarde) {
      throw new ConflictException('Esta sala não está disponível no turno da tarde.');
    }
    if (turno === Turno.NOITE && !sala.disponivel_noite) {
      throw new ConflictException('Esta sala não está disponível no turno da noite.');
    }
  }
}