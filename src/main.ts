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
  const app = await NestFactory.create(AppModule);

  // Configure CORS to allow access from any origin
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
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
