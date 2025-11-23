import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AttendeeController } from './attendee.controller';
import { AttendeeService } from './attendee.service';

@Module({
  imports: [HttpModule],
  controllers: [AttendeeController],
  providers: [AttendeeService],
})
export class AttendeeModule {}
