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
  // Abordagem mais direta - criar aplicação sem configurações CORS iniciais
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS com configuração mais permissiva possível
  app.enableCors({
    origin: '*',
    methods: '*',
    allowedHeaders: '*',
    exposedHeaders: '*',
    credentials: true,
  });

  // Middleware manual para garantir cabeçalhos CORS em todas as respostas
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET,PUT,POST,DELETE,OPTIONS',
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Accept, Authorization',
    );
    res.setHeader('Access-Control-Max-Age', '3600');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
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
