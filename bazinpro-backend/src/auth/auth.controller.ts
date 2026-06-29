import { Controller, Post, Body, UseGuards, Request, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('change-password')
  changerMotDePasse(
    @Request() req,
    @Body() body: { ancienMdp: string; nouveauMdp: string },
  ) {
    return this.authService.changerMotDePasse(req.user.id, body.ancienMdp, body.nouveauMdp);
  }
}
