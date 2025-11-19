import { Test, TestingModule } from '@nestjs/testing';
import { AttendeeModule } from './attendee.module';
import { AttendeeService } from './attendee.service';
import { AttendeeController } from './attendee.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('AttendeeModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AttendeeModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        attendee: {
          create: jest.fn(),
          findMany: jest.fn(),
          findUnique: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      })
      .compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should export AttendeeService', () => {
    const service = module.get<AttendeeService>(AttendeeService);
    expect(service).toBeDefined();
  });

  it('should provide AttendeeController', () => {
    const controller = module.get<AttendeeController>(AttendeeController);
    expect(controller).toBeDefined();
  });

  it('should have PrismaService as dependency', () => {
    const prismaService = module.get<PrismaService>(PrismaService);
    expect(prismaService).toBeDefined();
  });
});
