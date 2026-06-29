import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class RapportsService {
  constructor(private prisma: PrismaService) {}

  async statsSemaine(boutiqueId: string) {
    const results = [];
    for (let i = 6; i >= 0; i--) {
      const jour = new Date();
      jour.setDate(jour.getDate() - i);
      const debut = new Date(jour); debut.setHours(0, 0, 0, 0);
      const fin = new Date(jour); fin.setHours(23, 59, 59, 999);

      const ventes = await this.prisma.vente.findMany({
        where: { boutiqueId, statut: 'VALIDEE', createdAt: { gte: debut, lte: fin } },
      });
      const depenses = await this.prisma.depense.findMany({
        where: { boutiqueId, date: { gte: debut, lte: fin } },
      });

      const ca = ventes.reduce((s, v) => s + Number(v.montantTotal), 0);
      const totalDepenses = depenses.reduce((s, d) => s + Number(d.montant), 0);
      results.push({
        date: jour.toISOString().slice(0, 10),
        ca,
        nbVentes: ventes.length,
        depenses: totalDepenses,
        benefice: ca - totalDepenses,
      });
    }
    return results;
  }

  async statsMois(boutiqueId: string, annee?: number, mois?: number) {
    const now = new Date();
    const y = annee || now.getFullYear();
    const m = (mois || now.getMonth() + 1) - 1;
    const debut = new Date(y, m, 1);
    const fin = new Date(y, m + 1, 0, 23, 59, 59);

    const [ventes, depenses] = await Promise.all([
      this.prisma.vente.findMany({
        where: { boutiqueId, statut: 'VALIDEE', createdAt: { gte: debut, lte: fin } },
        include: { lignes: true },
      }),
      this.prisma.depense.findMany({
        where: { boutiqueId, date: { gte: debut, lte: fin } },
      }),
    ]);

    const ca = ventes.reduce((s, v) => s + Number(v.montantTotal), 0);
    const totalDepenses = depenses.reduce((s, d) => s + Number(d.montant), 0);

    return {
      periode: `${y}-${String(m + 1).padStart(2, '0')}`,
      ca,
      nbVentes: ventes.length,
      depenses: totalDepenses,
      benefice: ca - totalDepenses,
    };
  }

  async topProduits(boutiqueId: string, limit = 10) {
    const lignes = await this.prisma.ligneVente.findMany({
      where: { vente: { boutiqueId, statut: 'VALIDEE' } },
      include: { tissu: { include: { qualite: true, couleur: true } } },
    });

    const map: Record<string, { code: string; qualite: string; couleur: string; metrage: number; ca: number }> = {};
    for (const l of lignes) {
      const key = l.tissuCode;
      if (!map[key]) {
        map[key] = {
          code: l.tissuCode,
          qualite: l.qualiteNom,
          couleur: l.couleurNom,
          metrage: 0,
          ca: 0,
        };
      }
      map[key].metrage += Number(l.metrage);
      map[key].ca += Number(l.montant);
    }

    return Object.values(map)
      .sort((a, b) => b.ca - a.ca)
      .slice(0, limit);
  }

  async repartitionPaiements(boutiqueId: string) {
    const ventes = await this.prisma.vente.findMany({
      where: { boutiqueId, statut: 'VALIDEE' },
      select: { modePaiement: true, montantTotal: true },
    });

    const map: Record<string, number> = {};
    const total = ventes.reduce((s, v) => s + Number(v.montantTotal), 0);
    for (const v of ventes) {
      map[v.modePaiement] = (map[v.modePaiement] || 0) + Number(v.montantTotal);
    }

    return Object.entries(map).map(([mode, montant]) => ({
      mode,
      montant,
      pourcentage: total > 0 ? Math.round((montant / total) * 100) : 0,
    }));
  }
}
