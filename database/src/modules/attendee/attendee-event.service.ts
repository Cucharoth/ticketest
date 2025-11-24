import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttendeeEvent } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { CreateAttendeeEventDto } from './dto/create-attendee-event.dto';
import { UpdateAttendeeEventDto } from './dto/update-attendee-event.dto';
import { ConfirmAttendeeDto } from './dto/confirm-attendee.dto';

@Injectable()
export class AttendeeEventService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateAttendeeEventDto): Promise<AttendeeEvent> {
    try {
      return await this.prisma.attendeeEvent.create({
        data: {
          eventId: createDto.eventId,
          attendeeId: createDto.attendeeId,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Foreign key constraint failure
        if (error.code === 'P2003') {
          throw new ConflictException('Invalid attendeeId or eventId');
        }
      }
      throw error;
    }
  }

  async findAll(): Promise<AttendeeEvent[]> {
    return this.prisma.attendeeEvent.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<AttendeeEvent> {
    const attendeeEvent = await this.prisma.attendeeEvent.findUnique({
      where: { id },
      include: {
        event: true,
        attendee: true,
      },
    });

    if (!attendeeEvent) {
      throw new NotFoundException(`AttendeeEvent with ID ${id} not found`);
    }

    return attendeeEvent;
  }

  async findAllByEventIdAndAttendeeId(
    eventId: string,
    attendeeId: string,
  ): Promise<AttendeeEvent[]> {
    const attendeeEvents = await this.prisma.attendeeEvent.findMany({
      where: {
        attendeeId: attendeeId,
        eventId: eventId,
      },
    });

    // If no events found for the attendee, throw NotFoundException
    if (attendeeEvents.length === 0) {
      throw new NotFoundException(
        `No events found for Attendee with ID ${attendeeId}`,
      );
    }

    return attendeeEvents;
  }

  async update(
    id: string,
    updateDto: UpdateAttendeeEventDto,
  ): Promise<AttendeeEvent> {
    await this.findOne(id);

    try {
      return await this.prisma.attendeeEvent.update({
        where: { id },
        data: {
          eventId: updateDto.eventId,
          attendeeId: updateDto.attendeeId,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new ConflictException('Invalid attendeeId or eventId');
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<AttendeeEvent> {
    await this.findOne(id);

    return this.prisma.attendeeEvent.delete({
      where: { id },
    });
  }

  async confirm(id: string, confirmDto: ConfirmAttendeeDto): Promise<AttendeeEvent> {
    await this.findOne(id);

    try {
      return await this.prisma.attendeeEvent.update({
        where: { id },
        data: {
          confirmed: confirmDto.confirmed,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new ConflictException('Invalid attendeeId or eventId');
        }
      }
      throw error;
    }
  }
}
