import { Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';

import helmet from 'helmet';
import { cleanupOpenApiDoc } from 'nestjs-zod';

import { createSwaggerConfig, TEnv } from '@/config';
import { AppModule } from '@/modules';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get<ConfigService<TEnv, true>>(ConfigService);

  const port = configService.get('PORT', { infer: true });

  const isProduction: boolean =
    configService.get('NODE_ENV', { infer: true }) === 'production';

  app.use(helmet());

  app.enableCors({
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    origin: configService.get('CORS_ORIGINS', { infer: true }),
  });

  app.setGlobalPrefix('/api');

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.enableShutdownHooks();

  if (!isProduction) {
    SwaggerModule.setup(
      '/docs',
      app,
      cleanupOpenApiDoc(
        SwaggerModule.createDocument(app, createSwaggerConfig(port)),
      ),
    );
  }

  await app.listen(port);

  if (!isProduction) {
    Logger.debug(`Swagger UI running on host: http://localhost:${port}/docs`);
  }
}
void bootstrap();
