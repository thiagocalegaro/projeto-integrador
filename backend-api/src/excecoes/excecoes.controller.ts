import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ExcecoesService } from './excecoes.service';
import { CreateExcecaoDto } from './dto/create-excecao.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';
import { RolesGuard } from '../auth/guards/roles.guards';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../usuarios/enums/role.enum';

@Controller('excecoes')
export class ExcecoesController {
  constructor(private readonly excecoesService: ExcecoesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  create(@Body() createExcecaoDto: CreateExcecaoDto) {
    return this.excecoesService.create(createExcecaoDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.excecoesService.findAll();
  }



  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  remove(@Param('id') id: string) {
    return this.excecoesService.remove(+id);
  }
}
