import { validate } from 'class-validator';
import { UpdateAttendeeEventDto } from './update-attendee-event.dto';

describe('UpdateAttendeeEventDto', () => {
  let dto: UpdateAttendeeEventDto;

  beforeEach(() => {
    dto = new UpdateAttendeeEventDto();
  });

  it('should be defined', () => {
    expect(dto).toBeDefined();
  });

  it('should allow empty DTO (partial)', async () => {
    // PartialType makes fields optional
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should be valid when providing one valid UUID', async () => {
    dto.eventId = '123e4567-e89b-12d3-a456-426614174010';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should be invalid when providing invalid UUIDs', async () => {
    dto.eventId = 'not-a-uuid';
    dto.attendeeId = 'not-a-uuid-either';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });
});
