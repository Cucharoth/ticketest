import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Notification } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    try {
      return await this.prisma.notification.create({
        data: {
          message: createNotificationDto.message,
          sendDate: createNotificationDto.sendDate,
          attendeeId: createNotificationDto.attendeeId,
          type: createNotificationDto.type,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new ConflictException(
            'Invalid attendeeId or notification type',
          );
        }
      }
      throw error;
    }
  }

  async findAll(): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
      include: {
        attendee: true,
        notificationType: true,
      },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  async findByAttendeeId(attendeeId: string): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: { attendeeId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(
    id: string,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification> {
    await this.findOne(id);

    try {
      return await this.prisma.notification.update({
        where: { id },
        data: {
          message: updateNotificationDto.message,
          sendDate: updateNotificationDto.sendDate,
          attendeeId: updateNotificationDto.attendeeId,
          type: updateNotificationDto.type,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new ConflictException(
            'Invalid attendeeId or notification type',
          );
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<Notification> {
    await this.findOne(id);

    return this.prisma.notification.delete({
      where: { id },
    });
  }
}
