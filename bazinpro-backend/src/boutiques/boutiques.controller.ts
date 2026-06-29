import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BoutiquesService } from './boutiques.service';

@UseGuards(AuthGuard('jwt'))
@Controller('boutiques')
export class BoutiquesController {
  constructor(private boutiquesService: BoutiquesService) {}

  @Get('license-status')
  licenseStatus(@Request() req) {
    return this.boutiquesService.licenseStatus(req.user.boutiqueId);
  }

  @Get('me')
  findMe(@Request() req) {
    return this.boutiquesService.findOne(req.user.boutiqueId);
  }

  // Qualités
  @Get('qualites')
  findQualites(@Request() req) {
    return this.boutiquesService.findQualites(req.user.boutiqueId);
  }

  @Post('qualites')
  createQualite(@Request() req, @Body() body: { nom: string }) {
    return this.boutiquesService.createQualite(req.user.boutiqueId, body.nom);
  }

  @Delete('qualites/:id')
  deleteQualite(@Param('id') id: string, @Request() req) {
    return this.boutiquesService.deleteQualite(id, req.user.boutiqueId);
  }

  // Couleurs
  @Get('couleurs')
  findCouleurs(@Request() req) {
    return this.boutiquesService.findCouleurs(req.user.boutiqueId);
  }

  @Post('couleurs')
  createCouleur(@Request() req, @Body() body: { nom: string; hex: string }) {
    return this.boutiquesService.createCouleur(req.user.boutiqueId, body.nom, body.hex);
  }

  @Delete('couleurs/:id')
  deleteCouleur(@Param('id') id: string, @Request() req) {
    return this.boutiquesService.deleteCouleur(id, req.user.boutiqueId);
  }

  // Utilisateurs
  @Get('utilisateurs')
  findUtilisateurs(@Request() req) {
    return this.boutiquesService.findUtilisateurs(req.user.boutiqueId);
  }

  @Post('utilisateurs')
  createUtilisateur(@Request() req, @Body() dto: any) {
    return this.boutiquesService.createUtilisateur(req.user.boutiqueId, dto);
  }

  @Patch('utilisateurs/:id/toggle-actif')
  toggleActif(@Param('id') id: string, @Request() req) {
    return this.boutiquesService.toggleActif(id, req.user.boutiqueId);
  }

  @Patch('utilisateurs/:id/reset-password')
  resetPassword(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { nouveauMdp: string },
  ) {
    return this.boutiquesService.resetPassword(id, req.user.boutiqueId, body.nouveauMdp);
  }
}
