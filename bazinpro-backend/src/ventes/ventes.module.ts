import { Module } from '@nestjs/common';
import { VentesService } from './ventes.service';
import { VentesController } from './ventes.controller';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [VentesController],
  providers: [VentesService, PrismaService],
  exports: [VentesService],
})
export class VentesModule {}
