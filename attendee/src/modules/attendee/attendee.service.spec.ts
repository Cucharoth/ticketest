import { Test, TestingModule } from '@nestjs/testing';
import { AttendeeService } from './attendee.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { CreateAttendeeEventDto } from './dto/create-attendee-event.dto';
import { UpdateAttendeeDto } from './dto/update-attendee.dto';
import { ConfirmAttendeeDto } from './dto/confirm-attendee.dto';

describe('AttendeeService', () => {
  let service: AttendeeService;
  let httpService: HttpService;

  let mockHttpService: any;
  let mockConfigService: any;

  beforeEach(async () => {
    mockHttpService = {
      post: jest.fn(),
      get: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn().mockReturnValue('http://localhost:3000'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendeeService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AttendeeService>(AttendeeService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an attendee and link to event', async () => {
      const dto: CreateAttendeeEventDto = {
        name: 'John Doe',
        email: 'john@example.com',
        cellphone: '1234567890',
        eventId: 'event-uuid',
        confirmed: false,
      };
      const attendeeResponse = { id: 'attendee-uuid', ...dto };

      mockHttpService.post
        .mockReturnValueOnce(of({ data: attendeeResponse })) // Create attendee
        .mockReturnValueOnce(of({ data: { ...attendeeResponse, eventId: 'event-uuid' } })); // Link event

      const result = await service.create(dto);

      expect(result).toEqual(attendeeResponse);
      expect(httpService.post).toHaveBeenCalledTimes(2);
      expect(httpService.post).toHaveBeenCalledWith('http://localhost:3000/attendees', {
        name: dto.name,
        email: dto.email,
        cellphone: dto.cellphone,
      });
      expect(httpService.post).toHaveBeenCalledWith('http://localhost:3000/attendee-events', {
        attendeeId: 'attendee-uuid',
        eventId: 'event-uuid',
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of attendees', async () => {
      const result = [{ name: 'John Doe' }];
      mockHttpService.get.mockReturnValue(of({ data: result }));

      expect(await service.findAll()).toEqual(result);
      expect(httpService.get).toHaveBeenCalledWith('http://localhost:3000/attendee-events');
    });
  });

  describe('findOne', () => {
    it('should return a single attendee', async () => {
      const result = { id: 'uuid', name: 'John Doe' };
      mockHttpService.get.mockReturnValue(of({ data: result }));

      expect(await service.findOne('uuid')).toEqual(result);
      expect(httpService.get).toHaveBeenCalledWith('http://localhost:3000/attendee-events/uuid');
    });
  });

  describe('update', () => {
    it('should update an attendee', async () => {
      const dto: UpdateAttendeeDto = { name: 'Jane Doe' };
      const result = { id: 'uuid', name: 'Jane Doe' };
      mockHttpService.patch.mockReturnValue(of({ data: result }));

      expect(await service.update('uuid', dto)).toEqual(result);
      expect(httpService.patch).toHaveBeenCalledWith('http://localhost:3000/attendees/uuid', dto);
    });
  });

  describe('remove', () => {
    it('should remove an attendee', async () => {
      const result = { id: 'uuid', name: 'John Doe' };
      mockHttpService.delete.mockReturnValue(of({ data: result }));

      expect(await service.remove('uuid')).toEqual(result);
      expect(httpService.delete).toHaveBeenCalledWith('http://localhost:3000/attendees/uuid');
    });
  });

  describe('confirm', () => {
    it('should confirm an attendee', async () => {
      const dto: ConfirmAttendeeDto = { attendeeId: 'uuid', eventId: 'event-uuid', confirmed: true };
      const result = { id: 'uuid', confirmed: true };
      mockHttpService.post.mockReturnValue(of({ data: result }));

      expect(await service.confirm(dto)).toEqual(result);
      expect(httpService.post).toHaveBeenCalledWith(
        'http://localhost:3000/attendee-events/confirm/uuid',
        dto,
      );
    });
  });

  describe('findAllByEvent', () => {
    it('should return an array of attendee events', async () => {
      const result = [{ id: 'uuid', eventId: 'event-uuid' }];
      mockHttpService.get.mockReturnValue(of({ data: result }));

      expect(await service.findAllByEvent('event-uuid')).toEqual(result);
      expect(httpService.get).toHaveBeenCalledWith(
        'http://localhost:3000/attendee-events/events/event-uuid',
      );
    });
  });
});
