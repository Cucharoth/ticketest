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
    this.logger.error(error);
    if (error instanceof AxiosError) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
}
