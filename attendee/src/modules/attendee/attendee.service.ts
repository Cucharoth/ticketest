import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CreateAttendeeEventDto } from './dto/create-attendee-event.dto';
import { UpdateAttendeeDto } from './dto/update-attendee.dto';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';
import { ConfirmAttendeeDto } from './dto/confirm-attendee.dto';

@Injectable()
export class AttendeeService {
  private readonly logger = new Logger(AttendeeService.name);
  private readonly dbServiceUrl: string;
  private readonly notificationServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.dbServiceUrl = this.configService.get<string>('env.dbServiceUrl') ?? 'http://localhost:3000';
    this.notificationServiceUrl = this.configService.get<string>('env.notificationServiceUrl') ?? 'http://localhost:33205';
  }

  async create(createAttendeeEventDto: CreateAttendeeEventDto) {
    try {
      this.logger.log(`Creating Attendee name: ${createAttendeeEventDto.name}`);
      // 1. Create Attendee
      const { data: attendee } = await firstValueFrom(
        this.httpService.post(`${this.dbServiceUrl}/attendees`, {
          name: createAttendeeEventDto.name,
          email: createAttendeeEventDto.email,
          cellphone: createAttendeeEventDto.cellphone,
        }),
      );

      this.logger.log(`Attendee created: ${attendee.id}`);
      
      // 2. Send welcome notification
      await this.sendWelcomeNotification(attendee.id, attendee.name);
      
      // 3. Link to Event
      if (createAttendeeEventDto.eventId) {
        await firstValueFrom(
          this.httpService.post(`${this.dbServiceUrl}/attendee-events`, {
            attendeeId: attendee.id,
            eventId: createAttendeeEventDto.eventId,
          }),
        );
      }

      return attendee;
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAll() {
    this.logger.log(`Finding all Attendee-Events`);
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.dbServiceUrl}/attendee-events`),
      );
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOne(id: string) {
    this.logger.log(`Finding Attendee-Event by id: ${id}`);
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.dbServiceUrl}/attendee-events/${id}`),
      );
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(id: string, updateAttendeeDto: UpdateAttendeeDto) {
    this.logger.log(`Updating Attendee by id: ${id}`);
    try {
      const { data } = await firstValueFrom(
        this.httpService.patch(`${this.dbServiceUrl}/attendees/${id}`, updateAttendeeDto),
      );
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async remove(id: string) {
    this.logger.log(`Removing Attendee by id: ${id}`);
    try {
      const { data } = await firstValueFrom(
        this.httpService.delete(`${this.dbServiceUrl}/attendees/${id}`),
      );
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async confirm(confirmAttendeeDto: ConfirmAttendeeDto) {
    this.logger.log(`Confirming Attendee by id: ${confirmAttendeeDto.attendeeId}`);
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.dbServiceUrl}/attendee-events/confirm/${confirmAttendeeDto.attendeeId}`, confirmAttendeeDto),
      );
      
      // Send confirmation notification
      await this.sendConfirmationNotification(confirmAttendeeDto.attendeeId, data.attendee?.name || 'Asistente');
      
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAllByEvent(id: string) {
    this.logger.log(`Finding all Attendee-Events by event id: ${id}`);
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.dbServiceUrl}/attendee-events/events/${id}`),
      );
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  private async sendWelcomeNotification(attendeeId: string, attendeeName: string) {
    try {
      this.logger.log(`Sending welcome notification to attendee: ${attendeeId}`);
      await firstValueFrom(
        this.httpService.post(`${this.notificationServiceUrl}/api/notifications/send`, {
          attendee_id: attendeeId,
          message: `Bienvenido ${attendeeName}! Gracias por registrarte.`,
          type: '30000000-0000-0000-0000-000000000001', // Email notification type UUID
        }),
      );
      this.logger.log(`Welcome notification sent to attendee: ${attendeeId}`);
    } catch (error) {
      // Log error but don't fail the attendee creation
      this.logger.warn(`Failed to send welcome notification to attendee ${attendeeId}: ${error}`);
    }
  }

  private async sendConfirmationNotification(attendeeId: string, attendeeName: string) {
    try {
      this.logger.log(`Sending confirmation notification to attendee: ${attendeeId}`);
      await firstValueFrom(
        this.httpService.post(`${this.notificationServiceUrl}/api/notifications/send`, {
          attendee_id: attendeeId,
          message: `¡Hola ${attendeeName}! Tu asistencia ha sido confirmada exitosamente.`,
          type: '30000000-0000-0000-0000-000000000001', // Email notification type UUID
        }),
      );
      this.logger.log(`Confirmation notification sent to attendee: ${attendeeId}`);
    } catch (error) {
      // Log error but don't fail the confirmation
      this.logger.warn(`Failed to send confirmation notification to attendee ${attendeeId}: ${error}`);
    }
  }

  private handleError(error: any) {
    if (error instanceof AxiosError) {
      const { method, url } = error.config || {};
      const { status, statusText } = error.response || {};
      this.logger.error(
        `[DB Error] ${method?.toUpperCase()} ${url} - ${status} ${statusText}: ${JSON.stringify(
          error.response?.data,
        )}`,
      );
      throw error.response?.data || error.message;
    }
    this.logger.error(`[Internal Error] ${error.message}`, error.stack);
    throw error;
  }
}
