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
import { AttendeeService } from './attendee.service';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import { UpdateAttendeeDto } from './dto/update-attendee.dto';
import { Attendee } from '@prisma/client';

@Controller('attendees')
export class AttendeeController {
  constructor(private readonly attendeeService: AttendeeService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateAttendeeDto): Promise<Attendee> {
    return await this.attendeeService.create(dto);
  }

  @Get()
  @HttpCode(200)
  async findAll(): Promise<Attendee[]> {
    return await this.attendeeService.findAll();
  }

  @Get(':id')
  @HttpCode(200)
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Attendee> {
    return await this.attendeeService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(200)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAttendeeDto,
  ): Promise<Attendee> {
    return await this.attendeeService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<Attendee> {
    return await this.attendeeService.remove(id);
  }
}
