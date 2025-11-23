import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import { UpdateAttendeeDto } from './dto/update-attendee.dto';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';

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

  async create(createAttendeeDto: CreateAttendeeDto) {
    this.logger.log(`Creating Attendee name: ${createAttendeeDto.name}`);
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.dbServiceUrl}/attendees`, createAttendeeDto),
      );
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAll() {
    this.logger.log(`Finding all Attendees`);
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.dbServiceUrl}/attendees`),
      );
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOne(id: string) {
    this.logger.log(`Finding Attendee by id: ${id}`);
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.dbServiceUrl}/attendees/${id}`),
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
