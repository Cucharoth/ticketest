import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { EventController } from './event.controller';
import { EventService } from './event.service';

describe('EventModule', () => {
  let controller: EventController;
  let service: EventService;

  beforeEach(async () => {
    const eventModule: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [
        EventService,
        {
          provide: PrismaService,
          useValue: {
            event: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    controller = eventModule.get<EventController>(EventController);
    service = eventModule.get<EventService>(EventService);
  });

  it('should be defined with proper elements', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
