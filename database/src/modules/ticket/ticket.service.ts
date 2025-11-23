import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Ticket } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class TicketService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    try {
      return await this.prisma.ticket.create({
        data: {
          price: createTicketDto.price,
          typeId: createTicketDto.typeId,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new ConflictException('Invalid ticket typeId');
        }
      }
      throw error;
    }
  }

  async findAll(): Promise<Ticket[]> {
    return this.prisma.ticket.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        ticketType: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    return ticket;
  }

  async findByTypeId(typeId: string): Promise<Ticket[]> {
    return this.prisma.ticket.findMany({
      where: { typeId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(id: string, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    await this.findOne(id);

    try {
      return await this.prisma.ticket.update({
        where: { id },
        data: {
          price: updateTicketDto.price,
          typeId: updateTicketDto.typeId,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new ConflictException('Invalid ticket typeId');
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<Ticket> {
    await this.findOne(id);

    return this.prisma.ticket.delete({
      where: { id },
    });
  }
}
