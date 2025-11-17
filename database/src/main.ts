import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: ['log', 'error', 'debug', 'warn', 'verbose'],
  });

  const logger = app.get(Logger);

  app.useLogger(logger);
  app.flushLogs();

  app.enableShutdownHooks();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`Server is running on http://localhost:${port}`);
}
void bootstrap();
