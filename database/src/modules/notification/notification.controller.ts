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
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification } from '@prisma/client';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateNotificationDto): Promise<Notification> {
    return await this.notificationService.create(dto);
  }

  @Get()
  @HttpCode(200)
  async findAll(): Promise<Notification[]> {
    return await this.notificationService.findAll();
  }

  @Get(':id')
  @HttpCode(200)
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Notification> {
    return await this.notificationService.findOne(id);
  }

  @Get('attendee/:attendeeId')
  @HttpCode(200)
  async findByAttendeeId(
    @Param('attendeeId', ParseUUIDPipe) attendeeId: string,
  ): Promise<Notification[]> {
    return await this.notificationService.findByAttendeeId(attendeeId);
  }

  @Patch(':id')
  @HttpCode(200)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNotificationDto,
  ): Promise<Notification> {
    return await this.notificationService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<Notification> {
    return await this.notificationService.remove(id);
  }
}
