import { Module } from '@nestjs/common';
import { DepensesService } from './depenses.service';
import { DepensesController } from './depenses.controller';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [DepensesController],
  providers: [DepensesService, PrismaService],
})
export class DepensesModule {}
