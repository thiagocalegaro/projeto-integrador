import { Injectable } from '@nestjs/common';
import { CreateRecursoDto } from './dto/create-recurso.dto';
import { Recurso } from './entities/recurso.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RecursosService {
  constructor(
    @InjectRepository(Recurso)
    private readonly salasRepository: Repository<Recurso>,
  ) {}
  async create(createRecursoDto: CreateRecursoDto): Promise<Recurso> {
    const newRecurso = this.salasRepository.create(createRecursoDto);
    return this.salasRepository.save(newRecurso);
  }

  async findAll(): Promise<Recurso[]> {
    return this.salasRepository.find();
  }

  async findOne(id: number): Promise<Recurso> {
    const recurso = await this.salasRepository.findOneBy({ id });
    if (!recurso) {
      throw new Error(`Recurso com ID ${id} não encontrado.`);
    }
    return recurso;
  }

  async remove(id: number): Promise<Recurso> {
    const recurso = await this.findOne(id);
    await this.salasRepository.remove(recurso);
    return recurso;
  }

  async update(id: number, createRecursoDto: CreateRecursoDto): Promise<Recurso> {
    const recurso = await this.findOne(id);
    Object.assign(recurso, createRecursoDto);
    return this.salasRepository.save(recurso);
  }
}
