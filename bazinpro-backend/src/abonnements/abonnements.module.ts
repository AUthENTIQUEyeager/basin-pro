import { Module } from '@nestjs/common';
import { AbonnementsService } from './abonnements.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  providers: [AbonnementsService, PrismaService],
  exports: [AbonnementsService],
})
export class AbonnementsModule {}
