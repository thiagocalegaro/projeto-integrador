// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: any): Promise<{ access_token: string }> {
    const senhaFornecida = loginDto.senha || loginDto.password;
    const usuario = await this.usuariosService.login(
      loginDto.email,
      senhaFornecida,
    );
    

    const payload = {
      sub: usuario.id,
      email: usuario.email,
      tipo: usuario.tipo,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
