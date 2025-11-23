import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEventDto) {
    return await this.prisma.event.create({
      data: {
        name: dto.name,
        date: new Date(dto.date),
        place: dto.place,
        ticketMax: dto.ticketMax,
        ticketsLeft: dto.ticketMax,
        ticketSold: 0,
        typeId: dto.typeId,
      },
    });
  }

  async findAll() {
    return await this.prisma.event.findMany();
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  async update(id: string, dto: Partial<CreateEventDto>) {
    return await this.prisma.event.update({
      where: { id },
      data: {
        ...dto,
      },
    });
  }

  async remove(id: string) {
    return await this.prisma.event.delete({
      where: { id },
    });
  }
}
