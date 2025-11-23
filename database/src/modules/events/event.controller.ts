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
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/upload-event.dto';
import { Event } from '@prisma/client';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateEventDto): Promise<Event> {
    return await this.eventService.create(dto);
  }

  @Get()
  @HttpCode(200)
  async findAll(): Promise<Event[]> {
    return await this.eventService.findAll();
  }

  @Get(':id')
  @HttpCode(200)
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Event> {
    return await this.eventService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(200)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEventDto,
  ): Promise<Event> {
    return await this.eventService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<Event> {
    return await this.eventService.remove(id);
  }
}
