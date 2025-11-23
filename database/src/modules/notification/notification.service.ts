import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateNotificationDto) {
    // Find the notification type ID based on the string type (email/sms)
    const notificationType = await this.prisma.notificationType.findFirst({
      where: { type: dto.type },
    });

    if (!notificationType) {
      throw new NotFoundException(`Notification type '${dto.type}' not found`);
    }

    // Verify attendee exists
    const attendee = await this.prisma.attendee.findUnique({
      where: { id: dto.attendeeId },
    });

    if (!attendee) {
      throw new NotFoundException(`Attendee with ID ${dto.attendeeId} not found`);
    }

    return this.prisma.notification.create({
      data: {
        attendeeId: dto.attendeeId,
        message: dto.message,
        type: notificationType.id,
        sendDate: new Date(), // Assuming sent now
      },
    });
  }

  async findAll() {
    return this.prisma.notification.findMany({
      include: {
        attendee: true,
        notificationType: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
