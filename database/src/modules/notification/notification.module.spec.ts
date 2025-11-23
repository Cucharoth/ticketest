import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';

describe('NotificationModule', () => {
  let module: TestingModule;

  const mockPrismaService = {
    notification: {
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
        NotificationService,
        NotificationController,
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

  it('should provide NotificationService', () => {
    const service = module.get<NotificationService>(NotificationService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(NotificationService);
  });

  it('should provide NotificationController', () => {
    const controller = module.get<NotificationController>(
      NotificationController,
    );
    expect(controller).toBeDefined();
  });

  it('should inject PrismaService into NotificationService', () => {
    const service = module.get<NotificationService>(NotificationService);
    expect(service).toBeDefined();
    const prismaService = module.get<PrismaService>(PrismaService);
    expect(prismaService).toBe(mockPrismaService);
  });
});
