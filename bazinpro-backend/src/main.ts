import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Sécurité
  app.use((helmet as any).default());

  // CORS
  const origins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',');
  app.enableCors({
    origin: origins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Préfixe global API
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 BazinPro API démarrée sur le port ${port}`);
  console.log(`📊 Health check : http://localhost:${port}/api/health`);
}
bootstrap();
