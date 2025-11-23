import { Module } from '@nestjs/common';
import { AttendeeService } from './attendee.service';
import { AttendeeController } from './attendee.controller';
import { AttendeeEventService } from './attendee-event.service';
import { AttendeeEventController } from './attendee-event.controller';

@Module({
  imports: [],
  providers: [AttendeeService, AttendeeEventService],
  exports: [AttendeeService, AttendeeEventService],
  controllers: [AttendeeController, AttendeeEventController],
})
export class AttendeeModule {}
