import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TicketService } from './ticket.service';

describe('TicketService', () => {
  let service: TicketService;

  const mockTicket = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    price: new Prisma.Decimal(99.99),
    typeId: '123e4567-e89b-12d3-a456-426614174001',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTicketWithRelations = {
    ...mockTicket,
    ticketType: {
      id: '123e4567-e89b-12d3-a456-426614174001',
      type: 'VIP',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  const mockPrismaService = {
    ticket: {
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
        TicketService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TicketService>(TicketService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createTicketDto = {
      price: 99.99,
      typeId: '123e4567-e89b-12d3-a456-426614174001',
    };

    it('should create a new ticket successfully', async () => {
      mockPrismaService.ticket.create.mockResolvedValue(mockTicket);

      const result = await service.create(createTicketDto);

      expect(result).toEqual(mockTicket);
      expect(mockPrismaService.ticket.create).toHaveBeenCalledWith({
        data: createTicketDto,
      });
      expect(mockPrismaService.ticket.create).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException when foreign key constraint fails', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Foreign key constraint failed',
        {
          code: 'P2003',
          clientVersion: '5.0.0',
        },
      );

      mockPrismaService.ticket.create.mockRejectedValue(prismaError);

      await expect(service.create(createTicketDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createTicketDto)).rejects.toThrow(
        'Invalid ticket typeId',
      );
    });

    it('should propagate other errors', async () => {
      const genericError = new Error('Database connection error');
      mockPrismaService.ticket.create.mockRejectedValue(genericError);

      await expect(service.create(createTicketDto)).rejects.toThrow(
        genericError,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of tickets', async () => {
      const mockTickets = [
        mockTicket,
        { ...mockTicket, id: 'f6af0d3e-6b93-4c48-8a28-4eb322d00386' },
      ];
      mockPrismaService.ticket.findMany.mockResolvedValue(mockTickets);

      const result = await service.findAll();

      expect(result).toEqual(mockTickets);
      expect(mockPrismaService.ticket.findMany).toHaveBeenCalledWith({
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(mockPrismaService.ticket.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when no tickets exist', async () => {
      mockPrismaService.ticket.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a ticket with relations', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(
        mockTicketWithRelations,
      );

      const result = await service.findOne(mockTicket.id);

      expect(result).toEqual(mockTicketWithRelations);
      expect(mockPrismaService.ticket.findUnique).toHaveBeenCalledWith({
        where: { id: mockTicket.id },
        include: {
          ticketType: true,
        },
      });
    });

    it('should throw NotFoundException when ticket does not exist', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        'Ticket with ID non-existent-id not found',
      );
    });
  });

  describe('findByTypeId', () => {
    it('should return tickets for a specific type', async () => {
      const mockTickets = [mockTicket];
      mockPrismaService.ticket.findMany.mockResolvedValue(mockTickets);

      const result = await service.findByTypeId(mockTicket.typeId);

      expect(result).toEqual(mockTickets);
      expect(mockPrismaService.ticket.findMany).toHaveBeenCalledWith({
        where: { typeId: mockTicket.typeId },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should return empty array when type has no tickets', async () => {
      mockPrismaService.ticket.findMany.mockResolvedValue([]);

      const result = await service.findByTypeId('non-existent-type');

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    const updateTicketDto = {
      price: 149.99,
    };

    it('should update a ticket successfully', async () => {
      const updatedTicket = {
        ...mockTicket,
        price: new Prisma.Decimal(149.99),
      };
      mockPrismaService.ticket.findUnique.mockResolvedValue(
        mockTicketWithRelations,
      );
      mockPrismaService.ticket.update.mockResolvedValue(updatedTicket);

      const result = await service.update(mockTicket.id, updateTicketDto);

      expect(result).toEqual(updatedTicket);
      expect(mockPrismaService.ticket.update).toHaveBeenCalledWith({
        where: { id: mockTicket.id },
        data: updateTicketDto,
      });
    });

    it('should throw NotFoundException when ticket does not exist', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', updateTicketDto),
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

      mockPrismaService.ticket.findUnique.mockResolvedValue(
        mockTicketWithRelations,
      );
      mockPrismaService.ticket.update.mockRejectedValue(prismaError);

      await expect(
        service.update(mockTicket.id, { typeId: 'invalid-type-id' }),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.update(mockTicket.id, { typeId: 'invalid-type-id' }),
      ).rejects.toThrow('Invalid ticket typeId');
    });

    it('should propagate other errors', async () => {
      const genericError = new Error('Database connection error');
      mockPrismaService.ticket.findUnique.mockResolvedValue(
        mockTicketWithRelations,
      );
      mockPrismaService.ticket.update.mockRejectedValue(genericError);

      await expect(
        service.update(mockTicket.id, updateTicketDto),
      ).rejects.toThrow(genericError);
    });
  });

  describe('remove', () => {
    it('should remove a ticket successfully', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(
        mockTicketWithRelations,
      );
      mockPrismaService.ticket.delete.mockResolvedValue(mockTicket);

      const result = await service.remove(mockTicket.id);

      expect(result).toEqual(mockTicket);
      expect(mockPrismaService.ticket.delete).toHaveBeenCalledWith({
        where: { id: mockTicket.id },
      });
    });

    it('should throw NotFoundException when ticket does not exist', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.remove('non-existent-id')).rejects.toThrow(
        'Ticket with ID non-existent-id not found',
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

      mockPrismaService.ticket.findUnique.mockResolvedValue(
        mockTicketWithRelations,
      );
      mockPrismaService.ticket.update.mockRejectedValue(prismaError);

      await expect(
        service.update(mockTicket.id, { price: 200 }),
      ).rejects.toThrow(prismaError);
    });

    it('should handle database connection issues during create', async () => {
      const connectionError = new Error('Connection timeout');
      mockPrismaService.ticket.create.mockRejectedValue(connectionError);

      await expect(
        service.create({
          price: 99.99,
          typeId: '123e4567-e89b-12d3-a456-426614174001',
        }),
      ).rejects.toThrow('Connection timeout');
    });
  });
});
