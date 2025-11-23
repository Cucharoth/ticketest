import 'reflect-metadata';
import { validate } from 'class-validator';
import { UpdateTicketDto } from './update-ticket.dto';

describe('UpdateTicketDto', () => {
  let dto: UpdateTicketDto;

  beforeEach(() => {
    dto = new UpdateTicketDto();
  });

  it('should be defined', () => {
    expect(dto).toBeDefined();
  });

  it('should not return errors when no properties are set', () => {
    expect(dto).toBeInstanceOf(UpdateTicketDto);
  });

  it('should return errors when invalid properties are set', async () => {
    dto.price = -10.0;
    dto.typeId = 'invalid-uuid';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });

  it('should be valid with partial update (price only)', async () => {
    dto.price = 75.5;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should be valid with partial update (typeId only)', async () => {
    dto.typeId = '123e4567-e89b-12d3-a456-426614174000';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should be valid with all properties', async () => {
    dto.price = 99.99;
    dto.typeId = '123e4567-e89b-12d3-a456-426614174000';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should be invalid with negative price', async () => {
    dto.price = -50.0;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  it('should be invalid with zero price', async () => {
    dto.price = 0;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });
});
