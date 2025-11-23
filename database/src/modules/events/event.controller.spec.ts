import { Test, TestingModule } from '@nestjs/testing';
import { Event } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const mockEvents: Event[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Sample Event 1',
    date: new Date('2025-12-31T23:59:59Z'),
    place: 'Sample Place 1',
    ticketMax: 100,
    ticketsLeft: 0,
    ticketSold: 0,
    typeId: '',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
];

const mockEvent: Event = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Sample Event 1',
  date: new Date('2025-12-31T23:59:59Z'),
  place: 'Sample Place 1',
  typeId: '123e4567-e89b-12d3-a456-426614174001',
  ticketMax: 100,
  ticketsLeft: 0,
  ticketSold: 0,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
};

describe('EventController', () => {
  let controller: EventController;
  let service: EventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    controller = module.get<EventController>(EventController);
    service = module.get<EventService>(EventService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have called the find all service', async () => {
    const findAllSpy = jest
      .spyOn(service, 'findAll')
      .mockImplementation(() => Promise.resolve(mockEvents));
    await controller.findAll();
    expect(findAllSpy).toHaveBeenCalled();
  });

  it('should have called the create service with correct parameters', async () => {
    const dto: CreateEventDto = {
      name: 'Sample Event 1',
      date: new Date('2025-12-31T23:59:59Z').toString(),
      place: 'Sample Place 1',
      ticketMax: 100,
      typeId: '123e4567-e89b-12d3-a456-426614174001',
    };

    const createSpy = jest
      .spyOn(service, 'create')
      .mockImplementation(() => Promise.resolve(mockEvent));
    await controller.create(dto);
    expect(createSpy).toHaveBeenCalled();
    expect(createSpy).toHaveBeenCalledWith(dto);
  });

  it('should have called the find service', async () => {
    const id = '123e4567-e89b-12d3-a456-426614174000';

    const findOne = jest
      .spyOn(service, 'findOne')
      .mockImplementation(() => Promise.resolve(mockEvent));
    await controller.findOne(id);
    expect(findOne).toHaveBeenCalled();
    expect(findOne).toHaveBeenCalledWith(id);
  });

  it('should have called the update method of the service with correct params', async () => {
    const id = '123e4567-e89b-12d3-a456-426614174000';
    const updateDto: UpdateEventDto = {
      name: 'Updated Event Name',
      place: 'Updated Place',
    };

    const updateSpy = jest
      .spyOn(service, 'update')
      .mockImplementation(() => Promise.resolve(mockEvent));
    await controller.update(id, updateDto);
    expect(updateSpy).toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalledWith(id, updateDto);
  });

  it('should have called the delete method of the service with correct id', async () => {
    const id = '123e4567-e89b-12d3-a456-426614174000';

    const deleteSpy = jest
      .spyOn(service, 'remove')
      .mockImplementation(() => Promise.resolve(mockEvent));
    await controller.delete(id);
    expect(deleteSpy).toHaveBeenCalled();
    expect(deleteSpy).toHaveBeenCalledWith(id);
  });
});
