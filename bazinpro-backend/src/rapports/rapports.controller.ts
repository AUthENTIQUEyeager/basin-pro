import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RapportsService } from './rapports.service';

@UseGuards(AuthGuard('jwt'))
@Controller('rapports')
export class RapportsController {
  constructor(private rapportsService: RapportsService) {}

  @Get('semaine')
  semaine(@Request() req) {
    return this.rapportsService.statsSemaine(req.user.boutiqueId);
  }

  @Get('mois')
  mois(@Request() req, @Query('annee') annee?: string, @Query('mois') mois?: string) {
    return this.rapportsService.statsMois(
      req.user.boutiqueId,
      annee ? parseInt(annee) : undefined,
      mois ? parseInt(mois) : undefined,
    );
  }

  @Get('top-produits')
  topProduits(@Request() req, @Query('limit') limit?: string) {
    return this.rapportsService.topProduits(req.user.boutiqueId, limit ? parseInt(limit) : 10);
  }

  @Get('paiements')
  paiements(@Request() req) {
    return this.rapportsService.repartitionPaiements(req.user.boutiqueId);
  }
}
