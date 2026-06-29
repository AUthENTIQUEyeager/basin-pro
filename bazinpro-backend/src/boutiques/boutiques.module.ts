import { Module } from '@nestjs/common';
import { BoutiquesService } from './boutiques.service';
import { BoutiquesController } from './boutiques.controller';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [BoutiquesController],
  providers: [BoutiquesService, PrismaService],
  exports: [BoutiquesService],
})
export class BoutiquesModule {}
