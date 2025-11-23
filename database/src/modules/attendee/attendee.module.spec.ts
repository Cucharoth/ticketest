import { Test, TestingModule } from '@nestjs/testing';
import { AttendeeService } from './attendee.service';
import { AttendeeController } from './attendee.controller';
import { AttendeeEventService } from './attendee-event.service';
import { AttendeeEventController } from './attendee-event.controller';
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
    attendeeEvent: {
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
        AttendeeEventService,
        AttendeeController,
        AttendeeEventController,
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

  it('should provide AttendeeEventService', () => {
    const service = module.get<AttendeeEventService>(AttendeeEventService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(AttendeeEventService);
  });

  it('should provide AttendeeEventController', () => {
    const controller = module.get<AttendeeEventController>(
      AttendeeEventController,
    );
    expect(controller).toBeDefined();
  });

  it('should inject PrismaService into AttendeeService', () => {
    const service = module.get<AttendeeService>(AttendeeService);
    expect(service).toBeDefined();
    const prismaService = module.get<PrismaService>(PrismaService);
    expect(prismaService).toBe(mockPrismaService);
  });

  it('should inject PrismaService into AttendeeEventService', () => {
    const service = module.get<AttendeeEventService>(AttendeeEventService);
    expect(service).toBeDefined();
    const prismaService = module.get<PrismaService>(PrismaService);
    expect(prismaService).toBe(mockPrismaService);
  });
});
