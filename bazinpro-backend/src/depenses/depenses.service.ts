import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class DepensesService {
  constructor(private prisma: PrismaService) {}

  async findAll(boutiqueId: string, categorie?: string) {
    return this.prisma.depense.findMany({
      where: {
        boutiqueId,
        ...(categorie && categorie !== 'tous' ? { categorie } : {}),
      },
      include: { user: { select: { prenom: true, nom: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(boutiqueId: string, userId: string, dto: {
    categorie: string;
    montant: number;
    date: string;
    observation?: string;
  }) {
    return this.prisma.depense.create({
      data: {
        boutiqueId,
        userId,
        categorie: dto.categorie,
        montant: dto.montant,
        date: new Date(dto.date),
        observation: dto.observation,
        synced: true,
      },
    });
  }

  async totalParCategorie(boutiqueId: string, debut?: string, fin?: string) {
    const depenses = await this.prisma.depense.findMany({
      where: {
        boutiqueId,
        ...(debut && fin ? {
          date: { gte: new Date(debut), lte: new Date(fin) },
        } : {}),
      },
    });

    const parCategorie: Record<string, number> = {};
    for (const d of depenses) {
      parCategorie[d.categorie] = (parCategorie[d.categorie] || 0) + Number(d.montant);
    }
    return parCategorie;
  }
}
