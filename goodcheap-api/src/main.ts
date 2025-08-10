import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const config = app.get(ConfigService);
  const port = Number(config.get('PORT') || 3000);
  await app.listen(port);
  console.log(`GoodCheap API listening on :${port}`);
}
bootstrap();
