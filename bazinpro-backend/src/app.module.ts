import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { BoutiquesModule } from './boutiques/boutiques.module';
import { TissusModule } from './tissus/tissus.module';
import { VentesModule } from './ventes/ventes.module';
import { ClientsModule } from './clients/clients.module';
import { DepensesModule } from './depenses/depenses.module';
import { RapportsModule } from './rapports/rapports.module';
import { AbonnementsModule } from './abonnements/abonnements.module';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule,
    BoutiquesModule,
    TissusModule,
    VentesModule,
    ClientsModule,
    DepensesModule,
    RapportsModule,
    AbonnementsModule,
    SuperAdminModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
