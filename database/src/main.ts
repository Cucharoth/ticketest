import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
    {
      bufferLogs: true,
    },
  );

  const logger = app.get(Logger);

  app.useLogger(logger);
  app.flushLogs();

  app.enableShutdownHooks();

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '127.0.0.1');

  logger.log(`Server is running on http://localhost:${port}`);
}
void bootstrap();
