import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AttendeeService } from './attendee.service';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import { UpdateAttendeeDto } from './dto/update-attendee.dto';
import { Logger } from '@nestjs/common';

@Controller('attendees')
export class AttendeeController {
  private readonly logger = new Logger(AttendeeController.name);
  constructor(private readonly attendeeService: AttendeeService) {}

  @Post()
  create(@Body() createAttendeeDto: CreateAttendeeDto) {
    this.logger.log(`Attendee Controller create Called: ${JSON.stringify(createAttendeeDto)}`);
    return this.attendeeService.create(createAttendeeDto);
  }

  @Get()
  findAll() {
    this.logger.log(`Attendee Controller findAll Called`);
    return this.attendeeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    this.logger.log(`Attendee Controller findOne Called: ${JSON.stringify(id)}`);
    return this.attendeeService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAttendeeDto: UpdateAttendeeDto) {
    this.logger.log(`Attendee Controller update Called: ${JSON.stringify(id)}`);
    return this.attendeeService.update(id, updateAttendeeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.logger.log(`Attendee Controller remove Called: ${JSON.stringify(id)}`);
    return this.attendeeService.remove(id);
  }
}
