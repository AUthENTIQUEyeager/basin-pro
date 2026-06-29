import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AbonnementsService {
  private readonly logger = new Logger(AbonnementsService.name);

  constructor(private prisma: PrismaService) {}

  // Vérifier et mettre à jour les statuts tous les jours à 7h
  @Cron('0 7 * * *')
  async verifierExpirations() {
    this.logger.log('Vérification des expirations d\'abonnements...');
    const now = new Date();

    // Expirer les abonnements dépassés (+ 3j de grâce)
    const grace = new Date(now);
    grace.setDate(grace.getDate() - 3);

    await this.prisma.boutique.updateMany({
      where: {
        abonnementStatut: 'ACTIF',
        abonnementFin: { lt: grace },
      },
      data: { abonnementStatut: 'EXPIRE' },
    });

    // Suspendre après la période de grâce
    await this.prisma.boutique.updateMany({
      where: {
        abonnementStatut: 'EXPIRE',
        abonnementFin: { lt: grace },
      },
      data: { abonnementStatut: 'SUSPENDU' },
    });

    // Envoyer des rappels J-5, J-3, J-1
    await this.envoyerRappels();
  }

  private async envoyerRappels() {
    for (const jours of [5, 3, 1]) {
      const cible = new Date();
      cible.setDate(cible.getDate() + jours);
      cible.setHours(0, 0, 0, 0);
      const cibleFin = new Date(cible);
      cibleFin.setHours(23, 59, 59, 999);

      const boutiques = await this.prisma.boutique.findMany({
        where: {
          abonnementStatut: 'ACTIF',
          abonnementFin: { gte: cible, lte: cibleFin },
        },
        include: {
          utilisateurs: {
            where: { role: 'MANAGER', actif: true },
            select: { email: true, prenom: true, nom: true },
            take: 1,
          },
        },
      });

      for (const boutique of boutiques) {
        const manager = boutique.utilisateurs[0];
        if (!manager) continue;
        this.logger.log(
          `[RAPPEL J-${jours}] ${boutique.nom} — ${manager.email}`
        );
        // TODO: Envoyer email via NodeMailer
      }
    }
  }

  async reactiver(boutiqueId: string, nouvelleFin: Date) {
    return this.prisma.boutique.update({
      where: { id: boutiqueId },
      data: {
        abonnementStatut: 'ACTIF',
        abonnementFin: nouvelleFin,
      },
    });
  }

  async suspendre(boutiqueId: string) {
    return this.prisma.boutique.update({
      where: { id: boutiqueId },
      data: { abonnementStatut: 'SUSPENDU' },
    });
  }
}
