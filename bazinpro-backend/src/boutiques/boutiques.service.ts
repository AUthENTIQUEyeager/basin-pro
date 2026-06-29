import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BoutiquesService {
  constructor(private prisma: PrismaService) {}

  // ─── Boutique ──────────────────────────────────────────────────────────────
  async findOne(id: string) {
    const b = await this.prisma.boutique.findUnique({ where: { id } });
    if (!b) throw new NotFoundException('Boutique introuvable');
    return b;
  }

  async licenseStatus(boutiqueId: string) {
    const b = await this.prisma.boutique.findUnique({ where: { id: boutiqueId } });
    if (!b) throw new NotFoundException();
    const now = new Date();
    const fin = new Date(b.abonnementFin);
    const joursRestants = Math.ceil((fin.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return {
      statut: b.abonnementStatut.toLowerCase(),
      abonnementFin: b.abonnementFin,
      joursRestants: Math.max(0, joursRestants),
    };
  }

  // ─── Qualités ──────────────────────────────────────────────────────────────
  async findQualites(boutiqueId: string) {
    return this.prisma.qualite.findMany({ where: { boutiqueId }, orderBy: { nom: 'asc' } });
  }

  async createQualite(boutiqueId: string, nom: string) {
    return this.prisma.qualite.create({ data: { boutiqueId, nom } });
  }

  async deleteQualite(id: string, boutiqueId: string) {
    const q = await this.prisma.qualite.findFirst({ where: { id, boutiqueId } });
    if (!q) throw new NotFoundException();
    await this.prisma.qualite.delete({ where: { id } });
    return { message: 'Qualité supprimée' };
  }

  // ─── Couleurs ──────────────────────────────────────────────────────────────
  async findCouleurs(boutiqueId: string) {
    return this.prisma.couleur.findMany({ where: { boutiqueId }, orderBy: { nom: 'asc' } });
  }

  async createCouleur(boutiqueId: string, nom: string, hex: string) {
    return this.prisma.couleur.create({ data: { boutiqueId, nom, hex } });
  }

  async deleteCouleur(id: string, boutiqueId: string) {
    const c = await this.prisma.couleur.findFirst({ where: { id, boutiqueId } });
    if (!c) throw new NotFoundException();
    await this.prisma.couleur.delete({ where: { id } });
    return { message: 'Couleur supprimée' };
  }

  // ─── Utilisateurs ──────────────────────────────────────────────────────────
  async findUtilisateurs(boutiqueId: string) {
    return this.prisma.utilisateur.findMany({
      where: { boutiqueId },
      select: {
        id: true, nom: true, prenom: true, email: true,
        role: true, actif: true, derniereConnexion: true, createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createUtilisateur(boutiqueId: string, dto: {
    nom: string; prenom: string; email: string; password: string; role: string;
  }) {
    const hash = await bcrypt.hash(dto.password, 12);
    return this.prisma.utilisateur.create({
      data: {
        boutiqueId,
        nom: dto.nom,
        prenom: dto.prenom,
        email: dto.email,
        passwordHash: hash,
        role: dto.role.toUpperCase() as any,
      },
      select: { id: true, nom: true, prenom: true, email: true, role: true, actif: true },
    });
  }

  async toggleActif(id: string, boutiqueId: string) {
    const u = await this.prisma.utilisateur.findFirst({ where: { id, boutiqueId } });
    if (!u) throw new NotFoundException();
    return this.prisma.utilisateur.update({
      where: { id },
      data: { actif: !u.actif },
      select: { id: true, actif: true },
    });
  }

  async resetPassword(id: string, boutiqueId: string, nouveauMdp: string) {
    const u = await this.prisma.utilisateur.findFirst({ where: { id, boutiqueId } });
    if (!u) throw new NotFoundException();
    const hash = await bcrypt.hash(nouveauMdp, 12);
    await this.prisma.utilisateur.update({ where: { id }, data: { passwordHash: hash } });
    return { message: 'Mot de passe réinitialisé' };
  }
}
