import { Test, TestingModule } from '@nestjs/testing';
import { AttendeeController } from './attendee.controller';
import { AttendeeService } from './attendee.service';

describe('AttendeeController', () => {
  let controller: AttendeeController;

  const mockAttendee = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'John Doe',
    email: 'john.doe@example.com',
    cellphone: '+1234567890',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAttendeeService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendeeController],
      providers: [
        {
          provide: AttendeeService,
          useValue: mockAttendeeService,
        },
      ],
    }).compile();

    controller = module.get<AttendeeController>(AttendeeController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      cellphone: '+1234567890',
    };

    it('should create a new attendee', async () => {
      mockAttendeeService.create.mockResolvedValue(mockAttendee);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockAttendee);
      expect(mockAttendeeService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of attendees', async () => {
      const mockAttendees = [mockAttendee];
      mockAttendeeService.findAll.mockResolvedValue(mockAttendees);

      const result = await controller.findAll();

      expect(result).toEqual(mockAttendees);
      expect(mockAttendeeService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single attendee', async () => {
      mockAttendeeService.findOne.mockResolvedValue(mockAttendee);

      const result = await controller.findOne(mockAttendee.id);

      expect(result).toEqual(mockAttendee);
      expect(mockAttendeeService.findOne).toHaveBeenCalledWith(mockAttendee.id);
    });
  });

  describe('update', () => {
    const updateDto = {
      name: 'Jane Doe',
    };

    it('should update an attendee', async () => {
      const updatedAttendee = { ...mockAttendee, ...updateDto };
      mockAttendeeService.update.mockResolvedValue(updatedAttendee);

      const result = await controller.update(mockAttendee.id, updateDto);

      expect(result).toEqual(updatedAttendee);
      expect(mockAttendeeService.update).toHaveBeenCalledWith(
        mockAttendee.id,
        updateDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove an attendee', async () => {
      mockAttendeeService.remove.mockResolvedValue(mockAttendee);

      const result = await controller.remove(mockAttendee.id);

      expect(result).toEqual(mockAttendee);
      expect(mockAttendeeService.remove).toHaveBeenCalledWith(mockAttendee.id);
    });
  });
});
