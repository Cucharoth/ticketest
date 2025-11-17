import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [configuration],
    }),
    LoggerModule.forRoot({
      pinoHttp:
        process.env.NODE_ENV === 'production'
          ? {
              level: process.env.LOG_LEVEL || 'info',
              messageKey: 'message',
              serializers: {
                req: () => undefined,
                res: () => undefined,
              },
            }
          : {
              transport: {
                target: 'pino-pretty',
                options: {
                  messageKey: 'message',
                  colorize: true,
                  singleLine: true,
                  levelFirst: true,
                  translateTime: 'HH:MM:ss',
                },
              },
              level: process.env.LOG_LEVEL || 'debug',
              messageKey: 'message',
              serializers: {
                req: () => undefined,
                res: () => undefined,
              },
            },
    }),
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
