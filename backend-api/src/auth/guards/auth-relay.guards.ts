import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../../usuarios/enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class AuthRelayGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService, 
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de acesso não fornecido ou malformado.');
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET, 
      });

      request.user = payload;

      if (!requiredRoles) {
        return true;
      }

      const temPermissao = requiredRoles.some((role) => payload.tipo === role);
      
      if (!temPermissao) {
        throw new ForbiddenException('Acesso negado: Seu nível de usuário não permite esta ação.');
      }

      return true;

    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new UnauthorizedException('Sessão expirada ou Token inválido. Faça login novamente.');
    }
  }
}