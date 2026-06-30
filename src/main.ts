import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  // a) Describe API - build a config object
  const config = new DocumentBuilder()
    .setTitle('Backend NestJs API')
    .setDescription('fundamental of api development')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  // b) Generate the document from (config + app)
  const document = SwaggerModule.createDocument(app, config);
  // b2) Export the OpenAPI spec to a file (for sharing / client codegen)
  writeFileSync('./swagger.json', JSON.stringify(document, null, 2));
  // c) Mount the Interactive UI at the /api route, Optional beginner tip: make your JWT token survive a page refresh by passing a 4th argument:
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
  //
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
