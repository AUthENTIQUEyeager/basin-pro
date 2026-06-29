import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { StatutStock } from '@prisma/client';

@Injectable()
export class VentesService {
  constructor(private prisma: PrismaService) {}

  private async genererNumero(boutiqueId: string): Promise<string> {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `V-${yy}${mm}-`;
    const last = await this.prisma.vente.findFirst({
      where: { boutiqueId, numero: { startsWith: prefix } },
      orderBy: { createdAt: 'desc' },
    });
    const num = last ? parseInt(last.numero.split('-')[2] || '0') + 1 : 1;
    return `${prefix}${String(num).padStart(3, '0')}`;
  }

  async findAll(boutiqueId: string, search?: string, modePaiement?: string, statut?: string) {
    return this.prisma.vente.findMany({
      where: {
        boutiqueId,
        ...(statut && statut !== 'tous' ? { statut: statut.toUpperCase() as any } : {}),
        ...(modePaiement && modePaiement !== 'tous' ? { modePaiement: modePaiement.toUpperCase() as any } : {}),
        ...(search ? {
          OR: [
            { numero: { contains: search, mode: 'insensitive' } },
            { clientNom: { contains: search, mode: 'insensitive' } },
            { clientPrenom: { contains: search, mode: 'insensitive' } },
            { lignes: { some: { qualiteNom: { contains: search, mode: 'insensitive' } } } },
          ],
        } : {}),
      },
      include: {
        lignes: true,
        caissier: { select: { prenom: true, nom: true } },
        client: { select: { id: true, prenom: true, nom: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async findOne(id: string, boutiqueId: string) {
    const vente = await this.prisma.vente.findFirst({
      where: { id, boutiqueId },
      include: { lignes: true, caissier: { select: { prenom: true, nom: true } }, client: true },
    });
    if (!vente) throw new NotFoundException('Vente introuvable');
    return vente;
  }

  async create(boutiqueId: string, caissierIdRef: string, dto: any) {
    // Vérifier que le tissu existe et a assez de stock
    const tissu = await this.prisma.tissu.findFirst({
      where: { id: dto.tissuId, boutiqueId },
    });
    if (!tissu) throw new NotFoundException('Tissu introuvable');

    const metrage = parseFloat(dto.metrage);
    if (Number(tissu.metrageDisponible) < metrage) {
      throw new BadRequestException(
        `Stock insuffisant : ${tissu.metrageDisponible} m disponibles, ${metrage} m demandés`
      );
    }

    const numero = await this.genererNumero(boutiqueId);
    const prixUnitaire = Number(tissu.prixVente);
    const montantTotal = prixUnitaire * metrage;

    // Upsert client
    let clientId: string | undefined;
    if (dto.clientNom && dto.clientPrenom) {
      const existing = await this.prisma.client.findFirst({
        where: {
          boutiqueId,
          nom: dto.clientNom,
          prenom: dto.clientPrenom,
        },
      });
      if (existing) {
        clientId = existing.id;
      } else {
        const newClient = await this.prisma.client.create({
          data: {
            boutiqueId,
            nom: dto.clientNom,
            prenom: dto.clientPrenom,
            telephone: dto.clientTelephone,
          },
        });
        clientId = newClient.id;
      }
    }

    // Créer la vente
    const vente = await this.prisma.vente.create({
      data: {
        boutiqueId,
        numero,
        caissierIdRef,
        clientId: clientId ?? null,
        clientNom: dto.clientNom,
        clientPrenom: dto.clientPrenom,
        clientTelephone: dto.clientTelephone,
        montantTotal,
        modePaiement: dto.modePaiement.toUpperCase(),
        statut: 'VALIDEE',
        lignes: {
          create: [{
            tissuId: dto.tissuId,
            tissuCode: tissu.code,
            qualiteNom: dto.qualiteNom,
            couleurNom: dto.couleurNom,
            metrage,
            prixUnitaire,
            montant: montantTotal,
          }],
        },
      },
      include: { lignes: true },
    });

    // Déduire le stock
    const nouveauMetrage = Number(tissu.metrageDisponible) - metrage;
    const alerte = Number(tissu.metrageAlerte);
    const nouveauStatut: StatutStock =
      nouveauMetrage <= 0 ? 'EPUISE' : nouveauMetrage <= alerte ? 'BAS' : 'DISPONIBLE';

    await this.prisma.tissu.update({
      where: { id: dto.tissuId },
      data: { metrageDisponible: Math.max(0, nouveauMetrage), statut: nouveauStatut },
    });

    // Mouvement stock
    await this.prisma.mouvementStock.create({
      data: {
        tissuId: dto.tissuId,
        boutiqueId,
        type: 'SORTIE',
        quantite: metrage,
        motif: `Vente ${numero}`,
        userId: caissierIdRef,
      },
    });

    // Mettre à jour les stats client
    if (clientId) {
      await this.prisma.client.update({
        where: { id: clientId },
        data: {
          totalAchats: { increment: montantTotal },
          nbAchats: { increment: 1 },
          derniereVisite: new Date(),
        },
      });
    }

    return vente;
  }

  async annuler(id: string, boutiqueId: string, motif: string) {
    const vente = await this.prisma.vente.findFirst({
      where: { id, boutiqueId, statut: 'VALIDEE' },
      include: { lignes: true },
    });
    if (!vente) throw new NotFoundException('Vente introuvable ou déjà annulée');

    await this.prisma.vente.update({
      where: { id },
      data: { statut: 'ANNULEE', motifAnnulation: motif },
    });

    // Remettre le stock (retour)
    for (const ligne of vente.lignes) {
      if (!ligne.tissuId) continue;
      const tissu = await this.prisma.tissu.findUnique({ where: { id: ligne.tissuId } });
      if (!tissu) continue;
      const nouveau = Number(tissu.metrageDisponible) + Number(ligne.metrage);
      const alerte = Number(tissu.metrageAlerte);
      await this.prisma.tissu.update({
        where: { id: ligne.tissuId },
        data: {
          metrageDisponible: nouveau,
          statut: nouveau <= alerte ? 'BAS' : 'DISPONIBLE',
        },
      });
    }

    return { message: 'Vente annulée avec succès' };
  }

  async statsJour(boutiqueId: string, date?: string) {
    const jour = date ? new Date(date) : new Date();
    const debut = new Date(jour); debut.setHours(0, 0, 0, 0);
    const fin = new Date(jour); fin.setHours(23, 59, 59, 999);

    const ventes = await this.prisma.vente.findMany({
      where: { boutiqueId, statut: 'VALIDEE', createdAt: { gte: debut, lte: fin } },
    });

    const ca = ventes.reduce((s, v) => s + Number(v.montantTotal), 0);
    return { date: jour, ca, nbVentes: ventes.length };
  }
}
