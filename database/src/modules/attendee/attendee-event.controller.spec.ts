import { Test, TestingModule } from '@nestjs/testing';
import { AttendeeEventController } from './attendee-event.controller';
import { AttendeeEventService } from './attendee-event.service';

describe('AttendeeEventController', () => {
  let controller: AttendeeEventController;

  const mockAttendeeEvent = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    eventId: '223e4567-e89b-12d3-a456-426614174001',
    attendeeId: '323e4567-e89b-12d3-a456-426614174002',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAttendeeEventWithRelations = {
    ...mockAttendeeEvent,
    event: {
      id: '223e4567-e89b-12d3-a456-426614174001',
      name: 'Sample Event',
      date: new Date(),
      place: 'Hall A',
      ticketMax: 100,
      ticketsLeft: 100,
      ticketSold: 0,
      typeId: '423e4567-e89b-12d3-a456-426614174003',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    attendee: {
      id: '323e4567-e89b-12d3-a456-426614174002',
      name: 'Alice',
      email: 'alice@example.com',
      cellphone: '+1000000000',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  const mockAttendeeEventService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findAllByEventIdAndAttendeeId: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendeeEventController],
      providers: [
        {
          provide: AttendeeEventService,
          useValue: mockAttendeeEventService,
        },
      ],
    }).compile();

    controller = module.get<AttendeeEventController>(AttendeeEventController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      eventId: mockAttendeeEvent.eventId,
      attendeeId: mockAttendeeEvent.attendeeId,
    };

    it('should create a new attendee-event', async () => {
      mockAttendeeEventService.create.mockResolvedValue(mockAttendeeEvent);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockAttendeeEvent);
      expect(mockAttendeeEventService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of attendee-events', async () => {
      const items = [mockAttendeeEvent];
      mockAttendeeEventService.findAll.mockResolvedValue(items);

      const result = await controller.findAll();

      expect(result).toEqual(items);
      expect(mockAttendeeEventService.findAll).toHaveBeenCalled();
    });
  });

  describe('findAllByEventAndAttendee', () => {
    it('should return attendee-events filtered by event and attendee', async () => {
      const items = [mockAttendeeEventWithRelations];
      mockAttendeeEventService.findAllByEventIdAndAttendeeId.mockResolvedValue(
        items,
      );

      const result = await controller.findAllByEventAndAttendee(
        mockAttendeeEvent.eventId,
        mockAttendeeEvent.attendeeId,
      );

      expect(result).toEqual(items);
      expect(
        mockAttendeeEventService.findAllByEventIdAndAttendeeId,
      ).toHaveBeenCalledWith(
        mockAttendeeEvent.eventId,
        mockAttendeeEvent.attendeeId,
      );
    });

    it('should propagate not found error from service', async () => {
      const err = new Error('Not found');
      mockAttendeeEventService.findAllByEventIdAndAttendeeId.mockRejectedValue(
        err,
      );

      await expect(
        controller.findAllByEventAndAttendee('e-id', 'a-id'),
      ).rejects.toBe(err);
    });
  });

  describe('findOne', () => {
    it('should return a single attendee-event with relations', async () => {
      mockAttendeeEventService.findOne.mockResolvedValue(
        mockAttendeeEventWithRelations,
      );

      const result = await controller.findOne(mockAttendeeEvent.id);

      expect(result).toEqual(mockAttendeeEventWithRelations);
      expect(mockAttendeeEventService.findOne).toHaveBeenCalledWith(
        mockAttendeeEvent.id,
      );
    });
  });

  describe('update', () => {
    const updateDto = { eventId: mockAttendeeEvent.eventId };

    it('should update an attendee-event', async () => {
      const updated = { ...mockAttendeeEvent, eventId: updateDto.eventId };
      mockAttendeeEventService.update.mockResolvedValue(updated);

      const result = await controller.update(mockAttendeeEvent.id, updateDto);

      expect(result).toEqual(updated);
      expect(mockAttendeeEventService.update).toHaveBeenCalledWith(
        mockAttendeeEvent.id,
        updateDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove an attendee-event', async () => {
      mockAttendeeEventService.remove.mockResolvedValue(mockAttendeeEvent);

      const result = await controller.remove(mockAttendeeEvent.id);

      expect(result).toEqual(mockAttendeeEvent);
      expect(mockAttendeeEventService.remove).toHaveBeenCalledWith(
        mockAttendeeEvent.id,
      );
    });
  });
});
