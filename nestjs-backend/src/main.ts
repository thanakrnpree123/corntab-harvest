
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as compression from 'compression';
import * as helmet from 'helmet';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  // Global pipes, middleware and setup
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.use(compression());
  app.use(helmet());
  app.enableCors();
  
  // Set global prefix
  app.setGlobalPrefix('api');

  // Swagger documentation
  const options = new DocumentBuilder()
    .setTitle('CronTab API')
    .setDescription('API documentation for the CronTab application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/docs', app, document);

  // Start the server
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
