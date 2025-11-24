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
  async create(@Body() createAttendeeEventDto: CreateAttendeeEventDto) {
    this.logger.log(`Attendee Controller create Called: ${JSON.stringify(createAttendeeEventDto)}`);
    return await this.attendeeService.create(createAttendeeEventDto);
  }

  @Get()
  async findAll() {
    this.logger.log(`Attendee Controller findAll Called`);
    return await this.attendeeService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Attendee-Event Controller findOne Called: ${JSON.stringify(id)}`);
    return await this.attendeeService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateAttendeeDto: UpdateAttendeeDto) {
    this.logger.log(`Attendee Controller update Called: ${JSON.stringify(id)}`);
    return await this.attendeeService.update(id, updateAttendeeDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    this.logger.log(`Attendee Controller remove Called: ${JSON.stringify(id)}`);
    return await this.attendeeService.remove(id);
  }

  @Post('confirm')
  async confirm(@Body() confirmAttendeeDto: ConfirmAttendeeDto) {
    this.logger.log(`Attendee Controller confirm Called: ${JSON.stringify(confirmAttendeeDto)}`);
    return await this.attendeeService.confirm(confirmAttendeeDto);
  }

  @Get('events/:id')
  async findAllByEvent(@Param('id') id: string) {
    this.logger.log(`Attendee-Event Controller findAllByEvent Called: ${JSON.stringify(id)}`);
    return await this.attendeeService.findAllByEvent(id);
  }
}
