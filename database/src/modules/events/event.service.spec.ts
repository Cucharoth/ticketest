import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';

describe('EventService', () => {
  const mockPrismaService = {
    event: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockEvent = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Sample Event',
    date: new Date('2025-12-31T23:59:59Z'),
    place: 'Sample Place',
    ticketMax: 100,
    ticketLefts: 100,
    typeId: '123e4567-e89b-12d3-a456-426614174000',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createEventDto = {
      name: 'Sample Event',
      date: new Date('2025-12-31T23:59:59Z').toString(),
      place: 'Sample Place',
      ticketMax: 100,
      typeId: '123e4567-e89b-12d3-a456-426614174000',
    };

    it('should create a new event', async () => {
      mockPrismaService.event.create.mockResolvedValue(mockEvent);

      const result = await service.create(createEventDto);

      expect(result).toEqual(mockEvent);
    });
  });

  describe('findAll', () => {
    it('should return an array of events', async () => {
      mockPrismaService.event.findMany.mockResolvedValue([mockEvent]);

      const result = await service.findAll();

      expect(result).toEqual([mockEvent]);
    });
  });

  describe('findOne', () => {
    it('should return a single event', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue(mockEvent);

      const result = await service.findOne(mockEvent.id);

      expect(result).toEqual(mockEvent);
    });
  });

  describe('update', () => {
    const updateEventDto = {
      name: 'Updated Event',
      place: 'Updated Place',
    };

    it('should update an event', async () => {
      const updatedEvent = { ...mockEvent, ...updateEventDto };
      mockPrismaService.event.update.mockResolvedValue(updatedEvent);

      const result = await service.update(mockEvent.id, updateEventDto);

      expect(result).toEqual(updatedEvent);
    });
  });

  describe('remove', () => {
    it('should remove an event', async () => {
      mockPrismaService.event.delete.mockResolvedValue(mockEvent);

      const result = await service.remove(mockEvent.id);

      expect(result).toEqual(mockEvent);
    });
  });
});
