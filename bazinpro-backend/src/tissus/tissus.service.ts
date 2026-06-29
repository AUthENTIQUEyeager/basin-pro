import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { StatutStock } from '@prisma/client';

@Injectable()
export class TissusService {
  constructor(private prisma: PrismaService) {}

  async findAll(boutiqueId: string, search?: string, statut?: string) {
    return this.prisma.tissu.findMany({
      where: {
        boutiqueId,
        ...(statut && statut !== 'tous' ? { statut: statut.toUpperCase() as StatutStock } : {}),
        ...(search ? {
          OR: [
            { code: { contains: search, mode: 'insensitive' } },
            { qualite: { nom: { contains: search, mode: 'insensitive' } } },
            { couleur: { nom: { contains: search, mode: 'insensitive' } } },
          ],
        } : {}),
      },
      include: {
        qualite: { select: { id: true, nom: true } },
        couleur: { select: { id: true, nom: true, hex: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string, boutiqueId: string) {
    const tissu = await this.prisma.tissu.findFirst({
      where: { id, boutiqueId },
      include: {
        qualite: true,
        couleur: true,
        mouvementsStock: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { user: { select: { prenom: true, nom: true } } },
        },
      },
    });
    if (!tissu) throw new NotFoundException('Tissu introuvable');
    return tissu;
  }

  async create(boutiqueId: string, userId: string, dto: any) {
    const qualite = await this.prisma.qualite.findFirst({ where: { id: dto.qualiteId, boutiqueId } });
    if (!qualite) throw new NotFoundException('Qualité introuvable');

    const couleur = await this.prisma.couleur.findFirst({ where: { id: dto.couleurId, boutiqueId } });
    if (!couleur) throw new NotFoundException('Couleur introuvable');

    // Générer code unique
    const prefix = qualite.nom.slice(0, 3).toUpperCase();
    let code: string;
    let exists = true;
    while (exists) {
      const num = String(Math.floor(Math.random() * 900) + 100);
      code = `${prefix}-${num}`;
      exists = !!(await this.prisma.tissu.findUnique({ where: { code } }));
    }

    const metrage = parseFloat(dto.metrageDisponible);
    const alerte = parseFloat(dto.metrageAlerte ?? 5);
    const statut: StatutStock = metrage <= 0 ? 'EPUISE' : metrage <= alerte ? 'BAS' : 'DISPONIBLE';

    const tissu = await this.prisma.tissu.create({
      data: {
        boutiqueId,
        code: code!,
        qualiteId: dto.qualiteId,
        couleurId: dto.couleurId,
        metrageDisponible: metrage,
        metrageAlerte: alerte,
        prixAchat: dto.prixAchat ? parseFloat(dto.prixAchat) : null,
        prixVente: parseFloat(dto.prixVente),
        emplacement: dto.emplacement,
        observation: dto.observation,
        qrCode: `QR-${code!}`,
        statut,
      },
      include: { qualite: true, couleur: true },
    });

    // Journal
    await this.prisma.mouvementStock.create({
      data: {
        tissuId: tissu.id,
        boutiqueId,
        type: 'ENTREE',
        quantite: metrage,
        motif: 'Création du tissu',
        userId,
      },
    });

    return tissu;
  }

  async updateMetrage(id: string, boutiqueId: string, userId: string, nouveauMetrage: number, motif?: string) {
    const tissu = await this.prisma.tissu.findFirst({ where: { id, boutiqueId } });
    if (!tissu) throw new NotFoundException('Tissu introuvable');

    const ancien = Number(tissu.metrageDisponible);
    const alerte = Number(tissu.metrageAlerte);
    const statut: StatutStock = nouveauMetrage <= 0 ? 'EPUISE' : nouveauMetrage <= alerte ? 'BAS' : 'DISPONIBLE';

    const updated = await this.prisma.tissu.update({
      where: { id },
      data: { metrageDisponible: nouveauMetrage, statut },
      include: { qualite: true, couleur: true },
    });

    const diff = nouveauMetrage - ancien;
    await this.prisma.mouvementStock.create({
      data: {
        tissuId: id,
        boutiqueId,
        type: 'CORRECTION',
        quantite: Math.abs(diff),
        motif: motif ?? `Correction manuelle (${diff >= 0 ? '+' : ''}${diff} m)`,
        userId,
      },
    });

    return updated;
  }

  async alertes(boutiqueId: string) {
    return this.prisma.tissu.findMany({
      where: {
        boutiqueId,
        statut: { in: ['BAS', 'EPUISE'] },
      },
      include: { qualite: true, couleur: true },
      orderBy: { metrageDisponible: 'asc' },
    });
  }
}
