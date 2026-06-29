import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'fallback-secret',
    });
  }

  async validate(payload: { sub: string; email: string; role: string; boutiqueId: string }) {
    const user = await this.prisma.utilisateur.findUnique({
      where: { id: payload.sub },
      include: { boutique: true },
    });
    if (!user || !user.actif) throw new UnauthorizedException('Accès refusé');
    return user;
  }
}
