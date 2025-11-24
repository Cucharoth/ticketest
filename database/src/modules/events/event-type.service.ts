import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventTypeDto } from './dto/create-event-type.dto';

@Injectable()
export class EventTypeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEventTypeDto) {
    return await this.prisma.eventType.create({
      data: {
        name: dto.name,
      },
    });
  }

  async findAll() {
    return await this.prisma.eventType.findMany();
  }
}
