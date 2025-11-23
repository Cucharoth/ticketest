import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AttendeeModule } from './modules/attendee/attendee.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      cache: true,
      isGlobal: true,
      load: [configuration],
    }),
    AttendeeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
