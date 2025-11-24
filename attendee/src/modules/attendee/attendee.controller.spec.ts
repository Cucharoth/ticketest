import { Test, TestingModule } from '@nestjs/testing';
import { AttendeeController } from './attendee.controller';
import { AttendeeService } from './attendee.service';
import { CreateAttendeeEventDto } from './dto/create-attendee-event.dto';
import { UpdateAttendeeDto } from './dto/update-attendee.dto';
import { ConfirmAttendeeDto } from './dto/confirm-attendee.dto';

describe('AttendeeController', () => {
  let controller: AttendeeController;
  let service: AttendeeService;

  const mockAttendeeService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    confirm: jest.fn(),
    findAllByEvent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendeeController],
      providers: [
        { provide: AttendeeService, useValue: mockAttendeeService },
      ],
    }).compile();

    controller = module.get<AttendeeController>(AttendeeController);
    service = module.get<AttendeeService>(AttendeeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create', async () => {
      const dto: CreateAttendeeEventDto = {
        name: 'John Doe',
        email: 'john@example.com',
        cellphone: '1234567890',
        eventId: 'event-uuid',
        confirmed: false,
      };
      await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll', async () => {
      await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should call service.findOne', async () => {
      await controller.findOne('uuid');
      expect(service.findOne).toHaveBeenCalledWith('uuid');
    });
  });

  describe('update', () => {
    it('should call service.update', async () => {
      const dto: UpdateAttendeeDto = { name: 'Jane Doe' };
      await controller.update('uuid', dto);
      expect(service.update).toHaveBeenCalledWith('uuid', dto);
    });
  });

  describe('remove', () => {
    it('should call service.remove', async () => {
      await controller.remove('uuid');
      expect(service.remove).toHaveBeenCalledWith('uuid');
    });
  });

  describe('confirm', () => {
    it('should call service.confirm', async () => {
      const dto: ConfirmAttendeeDto = { attendeeId: 'uuid', eventId: 'event-uuid', confirmed: true };
      await controller.confirm(dto);
      expect(service.confirm).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAllByEvent', () => {
    it('should call service.findAllByEvent', async () => {
      await controller.findAllByEvent('event-uuid');
      expect(service.findAllByEvent).toHaveBeenCalledWith('event-uuid');
    });
  });
});
