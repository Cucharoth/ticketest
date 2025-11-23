import { Module } from '@nestjs/common';
import { AttendeeService } from './attendee.service';
import { AttendeeController } from './attendee.controller';

@Module({
  imports: [],
  providers: [AttendeeService],
  exports: [AttendeeService],
  controllers: [AttendeeController],
})
export class AttendeeModule {}
