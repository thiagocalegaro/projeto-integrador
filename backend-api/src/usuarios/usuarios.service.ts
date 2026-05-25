import { CreateUsuarioDto } from './dto/create-usuario.dto';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { Role } from './enums/role.enum';
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException
} from '@nestjs/common';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const { email, senha } = createUsuarioDto;
    const usuarioExistente = await this.usuariosRepository.findOneBy({ email });

    if (usuarioExistente) {
      throw new ConflictException(`O email '${email}' já está em uso.`);
    }

    const isFirstAccount = (await this.usuariosRepository.count()) === 0;
    const tipo = isFirstAccount ? Role.Admin : Role.User;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUsuarioDto.senha,
      saltRounds,
    );

    const newUser = this.usuariosRepository.create({
      ...createUsuarioDto,
      senha: hashedPassword,
      tipo: tipo,
    });
    
    return this.usuariosRepository.save(newUser);
  }

  findOne(id: number) {
    return this.usuariosRepository.findOneBy({ id });
  }

  async login(email: string, senhaFornecida: string): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOneBy({ email });

    if (!usuario) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordMatching = await bcrypt.compare(
      senhaFornecida,
      usuario.senha,
    );

    if (!isPasswordMatching) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    usuario.senha = 'senha removida por segurança';
    return usuario;
  }

  async findAll(): Promise<Usuario[]> {
    return this.usuariosRepository.find();
  }

  async remove(id: number): Promise<void> {
    const resultado = await this.usuariosRepository.delete(id);

    if (resultado.affected === 0) {
      throw new NotFoundException(`Sala com código ${id} não encontrada.`);
    }  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOneBy({ id });
    
    if (!usuario) {
      throw new NotFoundException(`Usuário com ID ${id} não foi encontrado.`);
    }
    const { senha, confirmar_senha, ...dadosParaAtualizar } = updateUsuarioDto;
    Object.assign(usuario, dadosParaAtualizar);

    // só se a senha for enviada e não está vazia
    if (senha && senha.trim() !== '') {
      if (senha !== confirmar_senha) {
        throw new BadRequestException('As senhas digitadas não coincidem.');
      }
      const salt = await bcrypt.genSalt(10);
      usuario.senha = await bcrypt.hash(senha, salt);
    }
    return await this.usuariosRepository.save(usuario);
  }
}
