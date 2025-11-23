import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  const mockNotification = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    message: 'Your ticket has been confirmed',
    sendDate: new Date('2024-01-15T10:00:00Z'),
    attendeeId: '123e4567-e89b-12d3-a456-426614174001',
    type: '123e4567-e89b-12d3-a456-426614174002',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockNotificationWithRelations = {
    ...mockNotification,
    attendee: {
      id: '123e4567-e89b-12d3-a456-426614174001',
      name: 'John Doe',
      email: 'john.doe@example.com',
      cellphone: '+1234567890',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    notificationType: {
      id: '123e4567-e89b-12d3-a456-426614174002',
      type: 'EMAIL',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  const mockPrismaService = {
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createNotificationDto = {
      message: 'Your ticket has been confirmed',
      sendDate: new Date('2024-01-15T10:00:00Z'),
      attendeeId: '123e4567-e89b-12d3-a456-426614174001',
      type: '123e4567-e89b-12d3-a456-426614174002',
    };

    it('should create a new notification successfully', async () => {
      mockPrismaService.notification.create.mockResolvedValue(mockNotification);

      const result = await service.create(createNotificationDto);

      expect(result).toEqual(mockNotification);
      expect(mockPrismaService.notification.create).toHaveBeenCalledWith({
        data: createNotificationDto,
      });
      expect(mockPrismaService.notification.create).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException when foreign key constraint fails', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Foreign key constraint failed',
        {
          code: 'P2003',
          clientVersion: '5.0.0',
        },
      );

      mockPrismaService.notification.create.mockRejectedValue(prismaError);

      await expect(service.create(createNotificationDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createNotificationDto)).rejects.toThrow(
        'Invalid attendeeId or notification type',
      );
    });

    it('should propagate other errors', async () => {
      const genericError = new Error('Database connection error');
      mockPrismaService.notification.create.mockRejectedValue(genericError);

      await expect(service.create(createNotificationDto)).rejects.toThrow(
        genericError,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of notifications', async () => {
      const mockNotifications = [
        mockNotification,
        { ...mockNotification, id: 'f6af0d3e-6b93-4c48-8a28-4eb322d00386' },
      ];
      mockPrismaService.notification.findMany.mockResolvedValue(
        mockNotifications,
      );

      const result = await service.findAll();

      expect(result).toEqual(mockNotifications);
      expect(mockPrismaService.notification.findMany).toHaveBeenCalledWith({
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(mockPrismaService.notification.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when no notifications exist', async () => {
      mockPrismaService.notification.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a notification with relations', async () => {
      mockPrismaService.notification.findUnique.mockResolvedValue(
        mockNotificationWithRelations,
      );

      const result = await service.findOne(mockNotification.id);

      expect(result).toEqual(mockNotificationWithRelations);
      expect(mockPrismaService.notification.findUnique).toHaveBeenCalledWith({
        where: { id: mockNotification.id },
        include: {
          attendee: true,
          notificationType: true,
        },
      });
    });

    it('should throw NotFoundException when notification does not exist', async () => {
      mockPrismaService.notification.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        'Notification with ID non-existent-id not found',
      );
    });
  });

  describe('findByAttendeeId', () => {
    it('should return notifications for a specific attendee', async () => {
      const mockNotifications = [mockNotification];
      mockPrismaService.notification.findMany.mockResolvedValue(
        mockNotifications,
      );

      const result = await service.findByAttendeeId(
        mockNotification.attendeeId,
      );

      expect(result).toEqual(mockNotifications);
      expect(mockPrismaService.notification.findMany).toHaveBeenCalledWith({
        where: { attendeeId: mockNotification.attendeeId },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should return empty array when attendee has no notifications', async () => {
      mockPrismaService.notification.findMany.mockResolvedValue([]);

      const result = await service.findByAttendeeId('non-existent-attendee');

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    const updateNotificationDto = {
      message: 'Your ticket has been updated',
      sendDate: new Date('2024-01-16T10:00:00Z'),
    };

    it('should update a notification successfully', async () => {
      const updatedNotification = {
        ...mockNotification,
        ...updateNotificationDto,
      };
      mockPrismaService.notification.findUnique.mockResolvedValue(
        mockNotificationWithRelations,
      );
      mockPrismaService.notification.update.mockResolvedValue(
        updatedNotification,
      );

      const result = await service.update(
        mockNotification.id,
        updateNotificationDto,
      );

      expect(result).toEqual(updatedNotification);
      expect(mockPrismaService.notification.update).toHaveBeenCalledWith({
        where: { id: mockNotification.id },
        data: updateNotificationDto,
      });
    });

    it('should throw NotFoundException when notification does not exist', async () => {
      mockPrismaService.notification.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', updateNotificationDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when foreign key constraint fails', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Foreign key constraint failed',
        {
          code: 'P2003',
          clientVersion: '5.0.0',
        },
      );

      mockPrismaService.notification.findUnique.mockResolvedValue(
        mockNotificationWithRelations,
      );
      mockPrismaService.notification.update.mockRejectedValue(prismaError);

      await expect(
        service.update(mockNotification.id, {
          attendeeId: 'invalid-attendee-id',
        }),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.update(mockNotification.id, {
          attendeeId: 'invalid-attendee-id',
        }),
      ).rejects.toThrow('Invalid attendeeId or notification type');
    });

    it('should propagate other errors', async () => {
      const genericError = new Error('Database connection error');
      mockPrismaService.notification.findUnique.mockResolvedValue(
        mockNotificationWithRelations,
      );
      mockPrismaService.notification.update.mockRejectedValue(genericError);

      await expect(
        service.update(mockNotification.id, updateNotificationDto),
      ).rejects.toThrow(genericError);
    });
  });

  describe('remove', () => {
    it('should remove a notification successfully', async () => {
      mockPrismaService.notification.findUnique.mockResolvedValue(
        mockNotificationWithRelations,
      );
      mockPrismaService.notification.delete.mockResolvedValue(mockNotification);

      const result = await service.remove(mockNotification.id);

      expect(result).toEqual(mockNotification);
      expect(mockPrismaService.notification.delete).toHaveBeenCalledWith({
        where: { id: mockNotification.id },
      });
    });

    it('should throw NotFoundException when notification does not exist', async () => {
      mockPrismaService.notification.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.remove('non-existent-id')).rejects.toThrow(
        'Notification with ID non-existent-id not found',
      );
    });
  });

  describe('error handling edge cases', () => {
    it('should handle concurrent updates', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        {
          code: 'P2025',
          clientVersion: '5.0.0',
        },
      );

      mockPrismaService.notification.findUnique.mockResolvedValue(
        mockNotificationWithRelations,
      );
      mockPrismaService.notification.update.mockRejectedValue(prismaError);

      await expect(
        service.update(mockNotification.id, { message: 'Updated' }),
      ).rejects.toThrow(prismaError);
    });

    it('should handle database connection issues during create', async () => {
      const connectionError = new Error('Connection timeout');
      mockPrismaService.notification.create.mockRejectedValue(connectionError);

      await expect(
        service.create({
          message: 'Test',
          sendDate: new Date(),
          attendeeId: '123e4567-e89b-12d3-a456-426614174001',
          type: '123e4567-e89b-12d3-a456-426614174002',
        }),
      ).rejects.toThrow('Connection timeout');
    });
  });
});
