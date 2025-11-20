import { Test, TestingModule } from '@nestjs/testing';
import { AttendeeService } from './attendee.service';
import { AttendeeController } from './attendee.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('AttendeeModule', () => {
  let module: TestingModule;

  const mockPrismaService = {
    attendee: {
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
        AttendeeService,
        AttendeeController,
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

  it('should provide AttendeeService', () => {
    const service = module.get<AttendeeService>(AttendeeService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(AttendeeService);
  });

  it('should provide AttendeeController', () => {
    const controller = module.get<AttendeeController>(AttendeeController);
    expect(controller).toBeDefined();
  });

  it('should inject PrismaService into AttendeeService', () => {
    const service = module.get<AttendeeService>(AttendeeService);
    expect(service).toBeDefined();
    const prismaService = module.get<PrismaService>(PrismaService);
    expect(prismaService).toBe(mockPrismaService);
  });
});
