import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AttendeeService } from './attendee.service';
import { CreateAttendeeEventDto } from './dto/create-attendee-event.dto';
import { UpdateAttendeeDto } from './dto/update-attendee.dto';
import { Logger } from '@nestjs/common';
import { ConfirmAttendeeDto } from './dto/confirm-attendee.dto';

@Controller('attendee-events')
export class AttendeeController {
  private readonly logger = new Logger(AttendeeController.name);
  constructor(private readonly attendeeService: AttendeeService) {}

  @Post()
  create(@Body() createAttendeeEventDto: CreateAttendeeEventDto) {
    this.logger.log(`Attendee Controller create Called: ${JSON.stringify(createAttendeeEventDto)}`);
    return this.attendeeService.create(createAttendeeEventDto);
  }

  @Get()
  findAll() {
    this.logger.log(`Attendee Controller findAll Called`);
    return this.attendeeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    this.logger.log(`Attendee-Event Controller findOne Called: ${JSON.stringify(id)}`);
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

  @Post('confirm')
  confirm(@Body() confirmAttendeeDto: ConfirmAttendeeDto) {
    this.logger.log(`Attendee Controller confirm Called: ${JSON.stringify(confirmAttendeeDto)}`);
    return this.attendeeService.confirm(confirmAttendeeDto);
  }

  @Get('events/:id')
  findAllByEvent(@Param('id') id: string) {
    this.logger.log(`Attendee-Event Controller findAllByEvent Called: ${JSON.stringify(id)}`);
    return this.attendeeService.findAllByEvent(id);
  }
}
