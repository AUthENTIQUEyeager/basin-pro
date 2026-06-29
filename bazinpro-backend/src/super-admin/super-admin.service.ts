import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class SuperAdminService {
  constructor(private prisma: PrismaService) {}

  private checkSuperAdmin(user: any) {
    if (user.role !== 'SUPER_ADMIN') throw new UnauthorizedException('Accès Super Admin requis');
  }

  async dashboard(user: any) {
    this.checkSuperAdmin(user);

    const [totalBoutiques, actives, suspendues, expirees] = await Promise.all([
      this.prisma.boutique.count(),
      this.prisma.boutique.count({ where: { abonnementStatut: 'ACTIF' } }),
      this.prisma.boutique.count({ where: { abonnementStatut: 'SUSPENDU' } }),
      this.prisma.boutique.count({ where: { abonnementStatut: 'EXPIRE' } }),
    ]);

    const ventesCeMois = await this.prisma.vente.aggregate({
      where: {
        statut: 'VALIDEE',
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { montantTotal: true },
      _count: { id: true },
    });

    const expirantBientot = await this.prisma.boutique.findMany({
      where: {
        abonnementStatut: 'ACTIF',
        abonnementFin: {
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      select: { id: true, nom: true, abonnementFin: true },
    });

    return {
      totalBoutiques,
      actives,
      suspendues,
      expirees,
      caMoisEnCours: Number(ventesCeMois._sum.montantTotal || 0),
      ventesMoisEnCours: ventesCeMois._count.id,
      expirantBientot,
    };
  }

  async listBoutiques(user: any) {
    this.checkSuperAdmin(user);
    return this.prisma.boutique.findMany({
      include: {
        _count: { select: { utilisateurs: true, ventes: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createBoutique(user: any, dto: {
    nom: string;
    adresse?: string;
    telephone?: string;
    abonnementFin: string;
    managerEmail: string;
    managerNom: string;
    managerPrenom: string;
    managerPassword: string;
  }) {
    this.checkSuperAdmin(user);
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash(dto.managerPassword, 12);

    const boutique = await this.prisma.boutique.create({
      data: {
        nom: dto.nom,
        adresse: dto.adresse,
        telephone: dto.telephone,
        abonnementFin: new Date(dto.abonnementFin),
        utilisateurs: {
          create: {
            nom: dto.managerNom,
            prenom: dto.managerPrenom,
            email: dto.managerEmail,
            passwordHash: hash,
            role: 'MANAGER',
          },
        },
      },
      include: { utilisateurs: { select: { id: true, email: true, role: true } } },
    });

    return boutique;
  }

  async suspendre(user: any, boutiqueId: string) {
    this.checkSuperAdmin(user);
    return this.prisma.boutique.update({
      where: { id: boutiqueId },
      data: { abonnementStatut: 'SUSPENDU' },
    });
  }

  async reactiver(user: any, boutiqueId: string, nouvelleFin: string) {
    this.checkSuperAdmin(user);
    return this.prisma.boutique.update({
      where: { id: boutiqueId },
      data: {
        abonnementStatut: 'ACTIF',
        abonnementFin: new Date(nouvelleFin),
      },
    });
  }

  async statsGlobales(user: any) {
    this.checkSuperAdmin(user);
    const derniers7j = [];
    for (let i = 6; i >= 0; i--) {
      const jour = new Date();
      jour.setDate(jour.getDate() - i);
      const debut = new Date(jour); debut.setHours(0, 0, 0, 0);
      const fin = new Date(jour); fin.setHours(23, 59, 59, 999);
      const agg = await this.prisma.vente.aggregate({
        where: { statut: 'VALIDEE', createdAt: { gte: debut, lte: fin } },
        _sum: { montantTotal: true },
        _count: { id: true },
      });
      derniers7j.push({
        date: jour.toISOString().slice(0, 10),
        ca: Number(agg._sum.montantTotal || 0),
        ventes: agg._count.id,
      });
    }
    return { derniers7j };
  }
}
