import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TissusService } from './tissus.service';

@UseGuards(AuthGuard('jwt'))
@Controller('tissus')
export class TissusController {
  constructor(private tissusService: TissusService) {}

  @Get()
  findAll(
    @Request() req,
    @Query('search') search?: string,
    @Query('statut') statut?: string,
  ) {
    return this.tissusService.findAll(req.user.boutiqueId, search, statut);
  }

  @Get('alertes')
  alertes(@Request() req) {
    return this.tissusService.alertes(req.user.boutiqueId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.tissusService.findOne(id, req.user.boutiqueId);
  }

  @Post()
  create(@Request() req, @Body() dto: any) {
    return this.tissusService.create(req.user.boutiqueId, req.user.id, dto);
  }

  @Patch(':id/metrage')
  updateMetrage(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { metrage: number; motif?: string },
  ) {
    return this.tissusService.updateMetrage(id, req.user.boutiqueId, req.user.id, body.metrage, body.motif);
  }
}
