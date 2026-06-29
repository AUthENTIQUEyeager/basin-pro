import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SuperAdminService } from './super-admin.service';

@UseGuards(AuthGuard('jwt'))
@Controller('super-admin')
export class SuperAdminController {
  constructor(private superAdminService: SuperAdminService) {}

  @Get('dashboard')
  dashboard(@Request() req) {
    return this.superAdminService.dashboard(req.user);
  }

  @Get('boutiques')
  listBoutiques(@Request() req) {
    return this.superAdminService.listBoutiques(req.user);
  }

  @Post('boutiques')
  createBoutique(@Request() req, @Body() dto: any) {
    return this.superAdminService.createBoutique(req.user, dto);
  }

  @Patch('boutiques/:id/suspendre')
  suspendre(@Request() req, @Param('id') id: string) {
    return this.superAdminService.suspendre(req.user, id);
  }

  @Patch('boutiques/:id/reactiver')
  reactiver(@Request() req, @Param('id') id: string, @Body() body: { nouvelleFin: string }) {
    return this.superAdminService.reactiver(req.user, id, body.nouvelleFin);
  }

  @Get('stats')
  stats(@Request() req) {
    return this.superAdminService.statsGlobales(req.user);
  }
}
