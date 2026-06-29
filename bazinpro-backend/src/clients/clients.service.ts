import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(boutiqueId: string, search?: string) {
    return this.prisma.client.findMany({
      where: {
        boutiqueId,
        ...(search ? {
          OR: [
            { nom: { contains: search, mode: 'insensitive' } },
            { prenom: { contains: search, mode: 'insensitive' } },
            { telephone: { contains: search } },
          ],
        } : {}),
      },
      orderBy: { totalAchats: 'desc' },
    });
  }

  async findOne(id: string, boutiqueId: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, boutiqueId },
      include: {
        ventes: {
          where: { statut: 'VALIDEE' },
          include: { lignes: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
    if (!client) throw new NotFoundException('Client introuvable');
    return client;
  }

  async create(boutiqueId: string, dto: { nom: string; prenom: string; telephone?: string }) {
    return this.prisma.client.create({ data: { boutiqueId, ...dto } });
  }
}
