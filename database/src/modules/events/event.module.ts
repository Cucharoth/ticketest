import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { EventTypeService } from './event-type.service';
import { EventTypeController } from './event-type.controller';

@Module({
  providers: [EventService, EventTypeService],
  controllers: [EventController, EventTypeController],
})
export class EventModule {}
