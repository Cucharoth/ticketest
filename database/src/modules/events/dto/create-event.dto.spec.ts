import { validate } from 'class-validator';
import { CreateEventDto } from './create-event.dto';

describe('CreateEventDto', () => {
  let dto: CreateEventDto;

  beforeEach(() => {
    dto = new CreateEventDto();
  });

  it('should be defined', () => {
    expect(dto).toBeDefined();
  });

  it('should have correct properties', async () => {
    dto.name = 'Sample Event';
    dto.date = new Date('2024-12-31T23:59:59Z').toString();
    dto.place = 'Sample Place';
    dto.ticketMax = 100;
    dto.typeId = '123e4567-e89b-12d3-a456-426614174000';

    const errors = await validate(dto);

    expect(dto.name).toBe('Sample Event');
    expect(dto.date).toBe('2024-12-31T23:59:59.000Z');
    expect(dto.place).toBe('Sample Place');
    expect(dto.ticketMax).toBe(100);
    expect(dto.typeId).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(errors.length).toBe(0);
  });

  it('should return errors for invalid properties', async () => {
    dto.name = '';
    dto.date = 'invalid-date';
    dto.place = '';
    dto.ticketMax = -10;
    dto.typeId = 'invalid-uuid';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThanOrEqual(5);
  });
});
