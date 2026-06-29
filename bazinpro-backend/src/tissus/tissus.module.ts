import { Module } from '@nestjs/common';
import { TissusService } from './tissus.service';
import { TissusController } from './tissus.controller';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [TissusController],
  providers: [TissusService, PrismaService],
  exports: [TissusService],
})
export class TissusModule {}
