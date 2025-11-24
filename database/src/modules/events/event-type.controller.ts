import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { EventTypeService } from './event-type.service';
import { CreateEventTypeDto } from './dto/create-event-type.dto';
import { EventType } from '@prisma/client';

@Controller('event-types')
export class EventTypeController {
  constructor(private readonly eventTypeService: EventTypeService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateEventTypeDto): Promise<EventType> {
    return await this.eventTypeService.create(dto);
  }

  @Get()
  @HttpCode(200)
  async findAll(): Promise<EventType[]> {
    return await this.eventTypeService.findAll();
  }
}
