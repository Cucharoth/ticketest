import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Attendee } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { UpdateAttendeeDto } from './dto/update-attendee.dto';
import { CreateAttendeeDto } from './dto/create-attendee.dto';

@Injectable()
export class AttendeeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAttendeeDto: CreateAttendeeDto): Promise<Attendee> {
    try {
      return await this.prisma.attendee.create({
        data: {
          name: createAttendeeDto.name,
          email: createAttendeeDto.email,
          cellphone: createAttendeeDto.cellphone,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Email already exists');
        }
      }
      throw error;
    }
  }

  async findAll(): Promise<Attendee[]> {
    return this.prisma.attendee.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<Attendee> {
    const attendee = await this.prisma.attendee.findUnique({
      where: { id },
      include: {
        notifications: true,
        attendeeEvents: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!attendee) {
      throw new NotFoundException(`Attendee with ID ${id} not found`);
    }

    return attendee;
  }

  async findByEmail(email: string): Promise<Attendee | null> {
    return this.prisma.attendee.findUnique({
      where: { email },
    });
  }

  async update(
    id: string,
    updateAttendeeDto: UpdateAttendeeDto,
  ): Promise<Attendee> {
    await this.findOne(id);

    try {
      return await this.prisma.attendee.update({
        where: { id },
        data: {
          name: updateAttendeeDto.name,
          email: updateAttendeeDto.email,
          cellphone: updateAttendeeDto.cellphone,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Email already exists');
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<Attendee> {
    await this.findOne(id);

    return this.prisma.attendee.delete({
      where: { id },
    });
  }
}
