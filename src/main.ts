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
  // Create app with simple CORS configuration
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: true, // Allow all origins
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: '*',
      preflightContinue: false,
    },
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
    // Make sure to use the same protocol (HTTP/HTTPS) in the server URL
    .addServer(
      'https://nest-langchain.up.railway.app',
      'Production Environment',
    )
    .addServer(
      'http://nest-langchain.up.railway.app',
      'Production HTTP Environment',
    )
    .addTag('agent', 'Endpoints of the search agent')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // Configure Swagger with CORS options
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'LangChain RAG API',
  });

  // Start the HTTP server - bind to all interfaces
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`Application running on port: ${port}`);
}

bootstrap();
