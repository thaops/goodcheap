import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const config = app.get(ConfigService);
  const startPort = Number(config.get('PORT') ?? 3000);

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
