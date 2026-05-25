import { 
  Injectable, 
  NotFoundException, 
  ConflictException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sala } from './entities/sala.entity';
import { SalaRecurso } from './entities/sala_recurso.entity';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';

@Injectable()
export class SalasService {
  constructor(
    @InjectRepository(Sala)
    private readonly salaRepository: Repository<Sala>,
    @InjectRepository(SalaRecurso)
    private readonly salaRecursoRepository: Repository<SalaRecurso>,
  ) {}

  async create(createSalaDto: CreateSalaDto): Promise<Sala> {
    const salaExistente = await this.salaRepository.findOne({
      where: { codigo: createSalaDto.codigo },
    });

    if (salaExistente) {
      throw new ConflictException(`Já existe uma sala cadastrada com o código "${createSalaDto.codigo}".`);
    }

    const { recursos, ...dadosSala } = createSalaDto;
    const novaSala = new Sala();
    Object.assign(novaSala, dadosSala);
    const salaSalva = await this.salaRepository.save(novaSala);

    if (recursos && recursos.length > 0) {
      const salaRecursos: SalaRecurso[] = recursos.map((recurso) => {
        const salaRecurso = this.salaRecursoRepository.create();
        salaRecurso.quantidade = recurso.quantidade;
        salaRecurso.sala = salaSalva;
        salaRecurso.recurso = { id: recurso.id } as any;
        return salaRecurso;
      });
      await this.salaRecursoRepository.save(salaRecursos);
    }

    return this.findOne(salaSalva.id_sala);
  }

  async findAll(): Promise<Sala[]> {
    return await this.salaRepository.find({
      relations: ['salaRecursos', 'salaRecursos.recurso'],
      order: { bloco: 'ASC', codigo: 'ASC' }, 
    });
  }

  async findOne(id: number): Promise<Sala> {
    const sala = await this.salaRepository.findOne({
      where: { id_sala: id },
      relations: ['salaRecursos', 'salaRecursos.recurso'],
    });

    if (!sala) {
      throw new NotFoundException(`Sala com o ID ${id} não foi encontrada.`);
    }

    return sala;
  }
  async findByBloco(bloco: string): Promise<Sala[]> {
    const salas = await this.salaRepository.find({
      where: { bloco },
      order: { codigo: 'ASC' },
    });
    return salas;
  }

  async update(id: number, updateSalaDto: UpdateSalaDto): Promise<Sala> {
    const sala = await this.findOne(id); 

    if (updateSalaDto.codigo && updateSalaDto.codigo !== sala.codigo) {
      const codigoEmUso = await this.salaRepository.findOne({
        where: { codigo: updateSalaDto.codigo },
      });
      if (codigoEmUso) {
        throw new ConflictException(`O código "${updateSalaDto.codigo}" já está sendo utilizado por outra sala.`);
      }
    }

    const { recursos, ...dadosAtualizacao } = updateSalaDto as any;
    const salaAtualizada = this.salaRepository.merge(sala, dadosAtualizacao);
    const salaSalva = await this.salaRepository.save(salaAtualizada);

    if (recursos) {
      await this.salaRecursoRepository.delete({ sala: { id_sala: salaSalva.id_sala } as any });
      if (recursos.length > 0) {
        const salaRecursos: SalaRecurso[] = recursos.map((recurso) => {
          const salaRecurso = this.salaRecursoRepository.create();
          salaRecurso.quantidade = recurso.quantidade;
          salaRecurso.sala = salaSalva;
          salaRecurso.recurso = { id: recurso.id } as any;
          return salaRecurso;
        });
        await this.salaRecursoRepository.save(salaRecursos);
      }
    }

    return this.findOne(salaSalva.id_sala);
  }

  async remove(id: number): Promise<void> {
    const sala = await this.findOne(id);
    await this.salaRepository.remove(sala);
  }
}