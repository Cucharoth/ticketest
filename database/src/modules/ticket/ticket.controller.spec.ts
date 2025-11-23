import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';

describe('TicketController', () => {
  let controller: TicketController;
  let service: TicketService;

  const mockTicket = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    price: new Prisma.Decimal(99.99),
    typeId: '123e4567-e89b-12d3-a456-426614174001',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTicketService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByTypeId: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketController],
      providers: [
        {
          provide: TicketService,
          useValue: mockTicketService,
        },
      ],
    }).compile();

    controller = module.get<TicketController>(TicketController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      price: 99.99,
      typeId: '123e4567-e89b-12d3-a456-426614174001',
    };

    it('should create a new ticket', async () => {
      mockTicketService.create.mockResolvedValue(mockTicket);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockTicket);
      expect(mockTicketService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of tickets', async () => {
      const mockTickets = [mockTicket];
      mockTicketService.findAll.mockResolvedValue(mockTickets);

      const result = await controller.findAll();

      expect(result).toEqual(mockTickets);
      expect(mockTicketService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single ticket', async () => {
      mockTicketService.findOne.mockResolvedValue(mockTicket);

      const result = await controller.findOne(mockTicket.id);

      expect(result).toEqual(mockTicket);
      expect(mockTicketService.findOne).toHaveBeenCalledWith(mockTicket.id);
    });
  });

  describe('findByTypeId', () => {
    it('should return tickets for a specific type', async () => {
      const mockTickets = [mockTicket];
      mockTicketService.findByTypeId.mockResolvedValue(mockTickets);

      const result = await controller.findByTypeId(mockTicket.typeId);

      expect(result).toEqual(mockTickets);
      expect(mockTicketService.findByTypeId).toHaveBeenCalledWith(
        mockTicket.typeId,
      );
    });
  });

  describe('update', () => {
    const updateDto = {
      price: 149.99,
    };

    it('should update a ticket', async () => {
      const updatedTicket = {
        ...mockTicket,
        price: new Prisma.Decimal(149.99),
      };
      mockTicketService.update.mockResolvedValue(updatedTicket);

      const result = await controller.update(mockTicket.id, updateDto);

      expect(result).toEqual(updatedTicket);
      expect(mockTicketService.update).toHaveBeenCalledWith(
        mockTicket.id,
        updateDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a ticket', async () => {
      mockTicketService.remove.mockResolvedValue(mockTicket);

      const result = await controller.remove(mockTicket.id);

      expect(result).toEqual(mockTicket);
      expect(mockTicketService.remove).toHaveBeenCalledWith(mockTicket.id);
    });
  });
});
