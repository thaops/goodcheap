import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const config = app.get(ConfigService);
  const startPort = Number(config.get('PORT') ?? 3000);
  const bodyLimit = String(config.get('JSON_BODY_LIMIT') ?? '2mb');
  app.use(json({ limit: bodyLimit }));
  app.use(urlencoded({ extended: true, limit: bodyLimit }));

  // Swagger setup (configurable via .env)
  const swaggerEnabled = String(config.get('SWAGGER_ENABLE') ?? '1') === '1';
  if (swaggerEnabled) {
    const swaggerPath = String(config.get('SWAGGER_PATH') ?? 'docs').replace(/^\/+/, '');
    const title = String(config.get('SWAGGER_TITLE') ?? 'GoodCheap API');
    const description = String(config.get('SWAGGER_DESCRIPTION') ?? 'API documentation');
    const version = String(config.get('SWAGGER_VERSION') ?? '1.0');
    const swaggerConfig = new DocumentBuilder()
      .setTitle(title)
      .setDescription(description)
      .setVersion(version)
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(swaggerPath, app, document);
    console.log(`Swagger UI available at /${swaggerPath}`);
  }

  // Try binding to startPort; if EADDRINUSE, increment up to 10 attempts
  let bound = false;
  for (let i = 0; i < 10; i++) {
    const port = startPort + i;
    try {
      await app.listen(port);
      console.log(`GoodCheap API listening on :${port}`);
      bound = true;
      break;
    } catch (err: any) {
      if (err && err.code === 'EADDRINUSE') {
        console.warn(`Port ${port} in use, trying ${port + 1}...`);
        continue;
      }
      throw err;
    }
  }
  if (!bound) {
    throw new Error(`No available port starting from ${startPort}.`);
  }
}
bootstrap();
