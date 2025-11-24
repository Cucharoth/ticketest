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

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.dbServiceUrl = this.configService.get<string>('env.dbServiceUrl') ?? 'http://localhost:3000';
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
      // 2. Link to Event
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
