import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.utilisateur.findUnique({
      where: { email },
      include: { boutique: true },
    });
    if (!user || !user.actif) throw new UnauthorizedException('Email ou mot de passe incorrect');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Email ou mot de passe incorrect');

    // Mettre à jour la dernière connexion
    await this.prisma.utilisateur.update({
      where: { id: user.id },
      data: { derniereConnexion: new Date() },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      boutiqueId: user.boutiqueId,
    };

    return {
      access_token: this.jwt.sign(payload),
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        boutiqueId: user.boutiqueId,
        boutique: {
          id: user.boutique.id,
          nom: user.boutique.nom,
          abonnementStatut: user.boutique.abonnementStatut,
          abonnementFin: user.boutique.abonnementFin,
        },
      },
    };
  }

  async changerMotDePasse(userId: string, ancienMdp: string, nouveauMdp: string) {
    const user = await this.prisma.utilisateur.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    const valid = await bcrypt.compare(ancienMdp, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Ancien mot de passe incorrect');

    const hash = await bcrypt.hash(nouveauMdp, 12);
    await this.prisma.utilisateur.update({
      where: { id: userId },
      data: { passwordHash: hash },
    });
    return { message: 'Mot de passe modifié avec succès' };
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }
}
