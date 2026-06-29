import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClientsService } from './clients.service';

@UseGuards(AuthGuard('jwt'))
@Controller('clients')
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Get()
  findAll(@Request() req, @Query('search') search?: string) {
    return this.clientsService.findAll(req.user.boutiqueId, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.clientsService.findOne(id, req.user.boutiqueId);
  }

  @Post()
  create(@Request() req, @Body() dto: { nom: string; prenom: string; telephone?: string }) {
    return this.clientsService.create(req.user.boutiqueId, dto);
  }
}
