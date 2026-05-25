import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SalasModule } from './salas/salas.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { RecursosModule } from './recursos/recursos.module';
import { ExcecoesModule } from './excecoes/excecoes.module';
import { AgendamentosModule } from './agendamentos/agendamentos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'booking-system',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    SalasModule,
    UsuariosModule,
    AuthModule,
    RecursosModule,
    ExcecoesModule,
    AgendamentosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
