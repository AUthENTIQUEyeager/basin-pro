import { Module } from '@nestjs/common';
import { RapportsService } from './rapports.service';
import { RapportsController } from './rapports.controller';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [RapportsController],
  providers: [RapportsService, PrismaService],
})
export class RapportsModule {}
