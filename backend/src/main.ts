import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('E-commerce API')
    .setDescription(`
API officielle de la plateforme E-commerce 🛍️

Fonctionnalités :
- Gestion des utilisateurs (Client, Marchand, Comptable, Administrateur)
- Commandes et livraisons
- Paiements (MTN MoMo, Moov, Stripe)
- Tracking temps réel
    `)
    .setVersion('1.0.0')
    
    // 🔐 Auth JWT
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Entrer le token JWT',
        in: 'header',
      },
      'access-token',
    )

    
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')

    // 🌐 Serveurs
    .addServer('http://localhost:3000', 'Local')
    .addServer('https://api.hotfood.com', 'Production')



    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // garde le token après refresh
    },
    customSiteTitle: 'E-commerce API Docs',
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();