import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { AttendeeEventService } from './attendee-event.service';
import { CreateAttendeeEventDto } from './dto/create-attendee-event.dto';
import { UpdateAttendeeEventDto } from './dto/update-attendee-event.dto';
import { AttendeeEvent } from '@prisma/client';
import { ConfirmAttendeeDto } from './dto/confirm-attendee.dto';

@Controller('attendee-events')
export class AttendeeEventController {
  constructor(private readonly attendeeEventService: AttendeeEventService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateAttendeeEventDto): Promise<AttendeeEvent> {
    return await this.attendeeEventService.create(dto);
  }

  @Get()
  @HttpCode(200)
  async findAll(): Promise<AttendeeEvent[]> {
    return await this.attendeeEventService.findAll();
  }

  @Get(':id')
  @HttpCode(200)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AttendeeEvent> {
    return await this.attendeeEventService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(200)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAttendeeEventDto,
  ): Promise<AttendeeEvent> {
    return await this.attendeeEventService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<AttendeeEvent> {
    return await this.attendeeEventService.remove(id);
  }

  @Post('confirm/:id')
  @HttpCode(200)
  async confirm(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ConfirmAttendeeDto,
  ): Promise<AttendeeEvent> {
    return await this.attendeeEventService.confirm(id, dto);
  }
}
