import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DepensesService } from './depenses.service';

@UseGuards(AuthGuard('jwt'))
@Controller('depenses')
export class DepensesController {
  constructor(private depensesService: DepensesService) {}

  @Get()
  findAll(@Request() req, @Query('categorie') categorie?: string) {
    return this.depensesService.findAll(req.user.boutiqueId, categorie);
  }

  @Get('stats/categories')
  totalParCategorie(
    @Request() req,
    @Query('debut') debut?: string,
    @Query('fin') fin?: string,
  ) {
    return this.depensesService.totalParCategorie(req.user.boutiqueId, debut, fin);
  }

  @Post()
  create(@Request() req, @Body() dto: {
    categorie: string;
    montant: number;
    date: string;
    observation?: string;
  }) {
    return this.depensesService.create(req.user.boutiqueId, req.user.id, dto);
  }
}
