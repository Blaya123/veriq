import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`FATAL: Required environment variable "${key}" is not set.`);
  return value;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors({ origin: requireEnv('CORS_ORIGIN'), credentials: true });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableShutdownHooks();

  await app.listen(process.env.PORT || '4000');
}
bootstrap();
