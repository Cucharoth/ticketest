import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';

describe('TicketModule', () => {
  let module: TestingModule;

  const mockPrismaService = {
    ticket: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        TicketService,
        TicketController,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide TicketService', () => {
    const service = module.get<TicketService>(TicketService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(TicketService);
  });

  it('should provide TicketController', () => {
    const controller = module.get<TicketController>(TicketController);
    expect(controller).toBeDefined();
  });

  it('should inject PrismaService into TicketService', () => {
    const service = module.get<TicketService>(TicketService);
    expect(service).toBeDefined();
    const prismaService = module.get<PrismaService>(PrismaService);
    expect(prismaService).toBe(mockPrismaService);
  });
});
