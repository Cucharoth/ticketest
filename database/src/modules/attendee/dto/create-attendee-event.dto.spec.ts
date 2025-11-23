import 'reflect-metadata';
import { validate } from 'class-validator';

describe('CreateAttendeeEventDto', () => {
  let dto: CreateAttendeeEventDto;

  beforeEach(() => {
    dto = new CreateAttendeeEventDto();
  });

  it('should be defined', () => {
    expect(dto).toBeDefined();
  });

  it('should have eventId and attendeeId properties', () => {
    dto.eventId = '123e4567-e89b-12d3-a456-426614174000';
    dto.attendeeId = '123e4567-e89b-12d3-a456-426614174001';

    expect(dto.eventId).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(dto.attendeeId).toBe('123e4567-e89b-12d3-a456-426614174001');
  });

  it('should be valid with correct UUIDs', async () => {
    dto.eventId = '123e4567-e89b-12d3-a456-426614174002';
    dto.attendeeId = '123e4567-e89b-12d3-a456-426614174003';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should be invalid with missing properties', async () => {
    // eventId missing
    dto.attendeeId = '123e4567-e89b-12d3-a456-426614174003';
    let errors = await validate(dto);
    expect(errors.length).toBeGreaterThanOrEqual(1);

    // attendeeId missing
    dto = new CreateAttendeeEventDto();
    dto.eventId = '123e4567-e89b-12d3-a456-426614174002';
    errors = await validate(dto);
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  it('should be invalid with malformed UUIDs', async () => {
    dto.eventId = 'invalid-uuid';
    dto.attendeeId = 'also-invalid';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });
});
