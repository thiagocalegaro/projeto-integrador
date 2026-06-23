import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Patch } from '@nestjs/common';
import { AgendamentosService } from './agendamentos.service';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';

@Controller('agendamentos')
@UseGuards(JwtAuthGuard)
export class AgendamentosController {
  constructor(private readonly agendamentosService: AgendamentosService) {}

  @Post()
  create(@Body() createAgendamentoDto: CreateAgendamentoDto, @Request() req) {
    return this.agendamentosService.create(createAgendamentoDto, req.user.id);
  }

  @Get()
  findAll() {
    return this.agendamentosService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agendamentosService.remove(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: CreateAgendamentoDto) {
    return this.agendamentosService.update(+id, dto);
  }
}