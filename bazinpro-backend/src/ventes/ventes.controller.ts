import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VentesService } from './ventes.service';

@UseGuards(AuthGuard('jwt'))
@Controller('ventes')
export class VentesController {
  constructor(private ventesService: VentesService) {}

  @Get()
  findAll(
    @Request() req,
    @Query('search') search?: string,
    @Query('modePaiement') modePaiement?: string,
    @Query('statut') statut?: string,
  ) {
    return this.ventesService.findAll(req.user.boutiqueId, search, modePaiement, statut);
  }

  @Get('stats/jour')
  statsJour(@Request() req, @Query('date') date?: string) {
    return this.ventesService.statsJour(req.user.boutiqueId, date);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.ventesService.findOne(id, req.user.boutiqueId);
  }

  @Post()
  create(@Request() req, @Body() dto: any) {
    return this.ventesService.create(req.user.boutiqueId, req.user.id, dto);
  }

  @Patch(':id/annuler')
  annuler(@Param('id') id: string, @Request() req, @Body() body: { motif: string }) {
    return this.ventesService.annuler(id, req.user.boutiqueId, body.motif);
  }
}
