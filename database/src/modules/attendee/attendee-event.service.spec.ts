import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AttendeeEventService } from './attendee-event.service';

describe('AttendeeEventService', () => {
  let service: AttendeeEventService;

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

  const mockPrismaService = {
    attendeeEvent: {
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
        AttendeeEventService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AttendeeEventService>(AttendeeEventService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      eventId: mockAttendeeEvent.eventId,
      attendeeId: mockAttendeeEvent.attendeeId,
    };

    it('should create a new attendee-event successfully', async () => {
      mockPrismaService.attendeeEvent.create.mockResolvedValue(
        mockAttendeeEvent,
      );

      const result = await service.create(createDto);

      expect(result).toEqual(mockAttendeeEvent);
      expect(mockPrismaService.attendeeEvent.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });

    it('should throw ConflictException on foreign key violation', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Foreign key constraint failed',
        {
          code: 'P2003',
          clientVersion: '5.0.0',
        },
      );
      mockPrismaService.attendeeEvent.create.mockRejectedValue(prismaError);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        'Invalid attendeeId or eventId',
      );
    });

    it('should propagate other errors', async () => {
      const genericError = new Error('Database down');
      mockPrismaService.attendeeEvent.create.mockRejectedValue(genericError);

      await expect(service.create(createDto)).rejects.toThrow(genericError);
    });
  });

  describe('findAll', () => {
    it('should return array of attendee-events', async () => {
      const items = [
        mockAttendeeEvent,
        { ...mockAttendeeEvent, id: 'f6af0d3e-6b93-4c48-8a28-4eb322d00386' },
      ];
      mockPrismaService.attendeeEvent.findMany.mockResolvedValue(items);

      const result = await service.findAll();

      expect(result).toEqual(items);
      expect(mockPrismaService.attendeeEvent.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when none', async () => {
      mockPrismaService.attendeeEvent.findMany.mockResolvedValue([]);

      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return attendee-event with relations', async () => {
      mockPrismaService.attendeeEvent.findUnique.mockResolvedValue(
        mockAttendeeEventWithRelations,
      );

      const result = await service.findOne(mockAttendeeEvent.id);

      expect(result).toEqual(mockAttendeeEventWithRelations);
      expect(mockPrismaService.attendeeEvent.findUnique).toHaveBeenCalledWith({
        where: { id: mockAttendeeEvent.id },
        include: { event: true, attendee: true },
      });
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrismaService.attendeeEvent.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        'AttendeeEvent with ID non-existent-id not found',
      );
    });
  });

  describe('update', () => {
    const updateDto = { eventId: mockAttendeeEvent.eventId };

    it('should update attendee-event successfully', async () => {
      const updated = { ...mockAttendeeEvent, eventId: updateDto.eventId };
      mockPrismaService.attendeeEvent.findUnique.mockResolvedValue(
        mockAttendeeEventWithRelations,
      );
      mockPrismaService.attendeeEvent.update.mockResolvedValue(updated);

      const result = await service.update(mockAttendeeEvent.id, updateDto);

      expect(result).toEqual(updated);
      expect(mockPrismaService.attendeeEvent.update).toHaveBeenCalledWith({
        where: { id: mockAttendeeEvent.id },
        data: { eventId: updateDto.eventId, attendeeId: undefined },
      });
    });

    it('should throw NotFoundException when updating non-existent', async () => {
      mockPrismaService.attendeeEvent.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException on FK violation', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('FK', {
        code: 'P2003',
        clientVersion: '5.0.0',
      });
      mockPrismaService.attendeeEvent.findUnique.mockResolvedValue(
        mockAttendeeEventWithRelations,
      );
      mockPrismaService.attendeeEvent.update.mockRejectedValue(prismaError);

      await expect(
        service.update(mockAttendeeEvent.id, { attendeeId: 'invalid' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should delete attendee-event successfully', async () => {
      mockPrismaService.attendeeEvent.findUnique.mockResolvedValue(
        mockAttendeeEventWithRelations,
      );
      mockPrismaService.attendeeEvent.delete.mockResolvedValue(
        mockAttendeeEvent,
      );

      const result = await service.remove(mockAttendeeEvent.id);
      expect(result).toEqual(mockAttendeeEvent);
      expect(mockPrismaService.attendeeEvent.delete).toHaveBeenCalledWith({
        where: { id: mockAttendeeEvent.id },
      });
    });

    it('should throw NotFoundException when deleting non-existent', async () => {
      mockPrismaService.attendeeEvent.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
