import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from '@nestjs/common';

/**
 * Bootstrap the NestJS application
 */
async function bootstrap() {
  // Criar aplicação sem CORS
  const app = await NestFactory.create(AppModule);

  // Desabilitar completamente CORS usando middleware personalizado
  app.use((req, res, next) => {
    // Desativar completamente o CORS para todas as solicitações
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Credentials', 'true');

    // Ajustando o Content-Type para facilitar as requisições OPTIONS
    if (req.method === 'OPTIONS') {
      res.header('Content-Type', 'text/plain');
      res.header('Content-Length', '0');
      res.sendStatus(200);
      return;
    }

    next();
  });

  // Global validation
  app.useGlobalPipes(new ValidationPipe());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('LangChain RAG API')
    .setDescription(
      'API for information retrieval using LangChain and ReAct Agent',
    )
    .setVersion('1.0')
    .addServer('http://localhost:3000', 'Local Environment')
    .addServer(
      'https://nest-langchain.up.railway.app',
      'Production Environment',
    )
    .addTag('agent', 'Endpoints of the search agent')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Configure Swagger com opções específicas para resolver problemas de CORS
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      withCredentials: true,
      tryItOutEnabled: true,
      displayRequestDuration: true,
      filter: true,
      deepLinking: true,
    },
  });

  // Start the HTTP server
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`Application running on port: ${port}`);
}

bootstrap();
