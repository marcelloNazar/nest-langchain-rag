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
  // Criando a aplicação sem CORS habilitado inicialmente
  const app = await NestFactory.create(AppModule);

  // Configuração que efetivamente desabilita as restrições de CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Middleware para garantir que não haja restrições de CORS
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');

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
    .addServer('http://localhost:3000/', 'Local Environment')
    .addServer(
      'https://nest-langchain.up.railway.app/',
      'Production Environment',
    )
    .addTag('agent', 'Endpoints of the search agent')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // Start the HTTP server
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`Application running on port: ${port}`);
}

bootstrap();
