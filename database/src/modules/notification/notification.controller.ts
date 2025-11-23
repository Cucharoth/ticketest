import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateNotificationDto) {
    return await this.notificationService.create(dto);
  }

  @Get()
  @HttpCode(200)
  async findAll() {
    return await this.notificationService.findAll();
  }
}
