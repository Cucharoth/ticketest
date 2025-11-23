import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { LoggerModule } from 'nestjs-pino';
import { AttendeeModule } from './modules/attendee/attendee.module';
import { EventModule } from './modules/events/event.module';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      cache: true,
      isGlobal: true,
      load: [configuration],
    }),
    LoggerModule.forRoot({
      pinoHttp:
        process.env.NODE_ENV === 'production'
          ? {
              level: process.env.LOG_LEVEL || 'info',
              autoLogging: false,
            }
          : {
              transport: {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: true,
                  levelFirst: true,
                  translateTime: 'HH:MM:ss',
                  ignore: 'pid,hostname',
                },
              },
              level: process.env.LOG_LEVEL || 'info',
              autoLogging: false,
            },
    }),
    PrismaModule,
    AttendeeModule,
    EventModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
