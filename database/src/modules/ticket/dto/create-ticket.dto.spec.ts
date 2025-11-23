import { validate } from 'class-validator';
import { CreateTicketDto } from './create-ticket.dto';

describe('CreateTicketDto', () => {
  let dto: CreateTicketDto;

  beforeEach(() => {
    dto = new CreateTicketDto();
  });

  it('should be defined', () => {
    expect(dto).toBeDefined();
  });

  it('should have price and typeId properties', async () => {
    dto.price = 99.99;
    dto.typeId = '123e4567-e89b-12d3-a456-426614174000';

    expect(dto.price).toBe(99.99);
    expect(dto.typeId).toBe('123e4567-e89b-12d3-a456-426614174000');
  });

  it('should be valid with correct properties', async () => {
    dto.price = 50.0;
    dto.typeId = '123e4567-e89b-12d3-a456-426614174000';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should be invalid with negative price', async () => {
    dto.price = -10.0;
    dto.typeId = '123e4567-e89b-12d3-a456-426614174000';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  it('should be invalid with zero price', async () => {
    dto.price = 0;
    dto.typeId = '123e4567-e89b-12d3-a456-426614174000';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  it('should be invalid with invalid typeId UUID', async () => {
    dto.price = 50.0;
    dto.typeId = 'invalid-uuid';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  it('should be invalid when price is missing', async () => {
    dto.typeId = '123e4567-e89b-12d3-a456-426614174000';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  it('should be invalid when typeId is missing', async () => {
    dto.price = 50.0;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  it('should be invalid with non-number price', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    dto.price = 'invalid-price' as any;
    dto.typeId = '123e4567-e89b-12d3-a456-426614174000';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  it('should be valid with decimal price', async () => {
    dto.price = 129.99;
    dto.typeId = '123e4567-e89b-12d3-a456-426614174000';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should be valid with integer price', async () => {
    dto.price = 100;
    dto.typeId = '123e4567-e89b-12d3-a456-426614174000';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
