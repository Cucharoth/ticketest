import { Test, TestingModule } from '@nestjs/testing';
import { AttendeeService } from './attendee.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('AttendeeService', () => {
  let service: AttendeeService;

  const mockAttendee = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'John Doe',
    email: 'john.doe@example.com',
    cellphone: '+1234567890',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAttendeeWithRelations = {
    ...mockAttendee,
    notifications: [],
    attendeeEvents: [
      {
        id: '123e4567-e89b-12d3-a456-426614174001',
        eventId: '123e4567-e89b-12d3-a456-426614174002',
        attendeeId: mockAttendee.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        event: {
          id: '123e4567-e89b-12d3-a456-426614174002',
          name: 'Tech Conference',
          date: new Date(),
          place: 'Convention Center',
          ticketMax: 100,
          ticketsLeft: 50,
          ticketSold: 50,
          typeId: '123e4567-e89b-12d3-a456-426614174003',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ],
  };

  const mockPrismaService = {
    attendee: {
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
        AttendeeService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AttendeeService>(AttendeeService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createAttendeeDto = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      cellphone: '+1234567890',
    };

    it('should create a new attendee successfully', async () => {
      mockPrismaService.attendee.create.mockResolvedValue(mockAttendee);

      const result = await service.create(createAttendeeDto);

      expect(result).toEqual(mockAttendee);
      expect(mockPrismaService.attendee.create).toHaveBeenCalledWith({
        data: createAttendeeDto,
      });
      expect(mockPrismaService.attendee.create).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException when email already exists', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '5.0.0',
        },
      );

      mockPrismaService.attendee.create.mockRejectedValue(prismaError);

      await expect(service.create(createAttendeeDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createAttendeeDto)).rejects.toThrow(
        'Email already exists',
      );
    });

    it('should propagate other errors', async () => {
      const genericError = new Error('Database connection error');
      mockPrismaService.attendee.create.mockRejectedValue(genericError);

      await expect(service.create(createAttendeeDto)).rejects.toThrow(
        genericError,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of attendees', async () => {
      const mockAttendees = [
        mockAttendee,
        { ...mockAttendee, id: 'f6af0d3e-6b93-4c48-8a28-4eb322d00386' },
      ];
      mockPrismaService.attendee.findMany.mockResolvedValue(mockAttendees);

      const result = await service.findAll();

      expect(result).toEqual(mockAttendees);
      expect(mockPrismaService.attendee.findMany).toHaveBeenCalledWith({
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(mockPrismaService.attendee.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when no attendees exist', async () => {
      mockPrismaService.attendee.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return an attendee with relations', async () => {
      mockPrismaService.attendee.findUnique.mockResolvedValue(
        mockAttendeeWithRelations,
      );

      const result = await service.findOne(mockAttendee.id);

      expect(result).toEqual(mockAttendeeWithRelations);
      expect(mockPrismaService.attendee.findUnique).toHaveBeenCalledWith({
        where: { id: mockAttendee.id },
        include: {
          notifications: true,
          attendeeEvents: {
            include: {
              event: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException when attendee does not exist', async () => {
      mockPrismaService.attendee.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        'Attendee with ID non-existent-id not found',
      );
    });
  });

  describe('findByEmail', () => {
    it('should return an attendee when email exists', async () => {
      mockPrismaService.attendee.findUnique.mockResolvedValue(mockAttendee);

      const result = await service.findByEmail(mockAttendee.email);

      expect(result).toEqual(mockAttendee);
      expect(mockPrismaService.attendee.findUnique).toHaveBeenCalledWith({
        where: { email: mockAttendee.email },
      });
    });

    it('should return null when email does not exist', async () => {
      mockPrismaService.attendee.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const updateAttendeeDto = {
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
    };

    it('should update an attendee successfully', async () => {
      const updatedAttendee = { ...mockAttendee, ...updateAttendeeDto };
      mockPrismaService.attendee.findUnique.mockResolvedValue(
        mockAttendeeWithRelations,
      );
      mockPrismaService.attendee.update.mockResolvedValue(updatedAttendee);

      const result = await service.update(mockAttendee.id, updateAttendeeDto);

      expect(result).toEqual(updatedAttendee);
      expect(mockPrismaService.attendee.update).toHaveBeenCalledWith({
        where: { id: mockAttendee.id },
        data: updateAttendeeDto,
      });
    });

    it('should throw NotFoundException when attendee does not exist', async () => {
      mockPrismaService.attendee.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', updateAttendeeDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when email already exists', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '5.0.0',
        },
      );

      mockPrismaService.attendee.findUnique.mockResolvedValue(
        mockAttendeeWithRelations,
      );
      mockPrismaService.attendee.update.mockRejectedValue(prismaError);

      await expect(
        service.update(mockAttendee.id, updateAttendeeDto),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.update(mockAttendee.id, updateAttendeeDto),
      ).rejects.toThrow('Email already exists');
    });

    it('should propagate other errors', async () => {
      const genericError = new Error('Database connection error');
      mockPrismaService.attendee.findUnique.mockResolvedValue(
        mockAttendeeWithRelations,
      );
      mockPrismaService.attendee.update.mockRejectedValue(genericError);

      await expect(
        service.update(mockAttendee.id, updateAttendeeDto),
      ).rejects.toThrow(genericError);
    });
  });

  describe('remove', () => {
    it('should remove an attendee successfully', async () => {
      mockPrismaService.attendee.findUnique.mockResolvedValue(
        mockAttendeeWithRelations,
      );
      mockPrismaService.attendee.delete.mockResolvedValue(mockAttendee);

      const result = await service.remove(mockAttendee.id);

      expect(result).toEqual(mockAttendee);
      expect(mockPrismaService.attendee.delete).toHaveBeenCalledWith({
        where: { id: mockAttendee.id },
      });
    });

    it('should throw NotFoundException when attendee does not exist', async () => {
      mockPrismaService.attendee.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.remove('non-existent-id')).rejects.toThrow(
        'Attendee with ID non-existent-id not found',
      );
    });
  });

  describe('error handling edge cases', () => {
    it('should handle concurrent email updates', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '5.0.0',
        },
      );

      mockPrismaService.attendee.findUnique.mockResolvedValue(
        mockAttendeeWithRelations,
      );
      mockPrismaService.attendee.update.mockRejectedValue(prismaError);

      await expect(
        service.update(mockAttendee.id, { email: 'existing@example.com' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should handle database connection issues during create', async () => {
      const connectionError = new Error('Connection timeout');
      mockPrismaService.attendee.create.mockRejectedValue(connectionError);

      await expect(
        service.create({
          name: 'Test',
          email: 'test@example.com',
          cellphone: '+1234567890',
        }),
      ).rejects.toThrow('Connection timeout');
    });
  });
});
