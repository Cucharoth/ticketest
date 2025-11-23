import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

describe('NotificationController', () => {
  let controller: NotificationController;
  const mockNotification = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    message: 'Your ticket has been confirmed',
    sendDate: new Date('2024-01-15T10:00:00Z'),
    attendeeId: '123e4567-e89b-12d3-a456-426614174001',
    type: '123e4567-e89b-12d3-a456-426614174002',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockNotificationService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByAttendeeId: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      message: 'Your ticket has been confirmed',
      sendDate: new Date('2024-01-15T10:00:00Z'),
      attendeeId: '123e4567-e89b-12d3-a456-426614174001',
      type: '123e4567-e89b-12d3-a456-426614174002',
    };

    it('should create a new notification', async () => {
      mockNotificationService.create.mockResolvedValue(mockNotification);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockNotification);
      expect(mockNotificationService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of notifications', async () => {
      const mockNotifications = [mockNotification];
      mockNotificationService.findAll.mockResolvedValue(mockNotifications);

      const result = await controller.findAll();

      expect(result).toEqual(mockNotifications);
      expect(mockNotificationService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single notification', async () => {
      mockNotificationService.findOne.mockResolvedValue(mockNotification);

      const result = await controller.findOne(mockNotification.id);

      expect(result).toEqual(mockNotification);
      expect(mockNotificationService.findOne).toHaveBeenCalledWith(
        mockNotification.id,
      );
    });
  });

  describe('findByAttendeeId', () => {
    it('should return notifications for a specific attendee', async () => {
      const mockNotifications = [mockNotification];
      mockNotificationService.findByAttendeeId.mockResolvedValue(
        mockNotifications,
      );

      const result = await controller.findByAttendeeId(
        mockNotification.attendeeId,
      );

      expect(result).toEqual(mockNotifications);
      expect(mockNotificationService.findByAttendeeId).toHaveBeenCalledWith(
        mockNotification.attendeeId,
      );
    });
  });

  describe('update', () => {
    const updateDto = {
      message: 'Your ticket has been updated',
    };

    it('should update a notification', async () => {
      const updatedNotification = { ...mockNotification, ...updateDto };
      mockNotificationService.update.mockResolvedValue(updatedNotification);

      const result = await controller.update(mockNotification.id, updateDto);

      expect(result).toEqual(updatedNotification);
      expect(mockNotificationService.update).toHaveBeenCalledWith(
        mockNotification.id,
        updateDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a notification', async () => {
      mockNotificationService.remove.mockResolvedValue(mockNotification);

      const result = await controller.remove(mockNotification.id);

      expect(result).toEqual(mockNotification);
      expect(mockNotificationService.remove).toHaveBeenCalledWith(
        mockNotification.id,
      );
    });
  });
});
