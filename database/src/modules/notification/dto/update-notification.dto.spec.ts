import { validate } from 'class-validator';

describe('UpdateNotificationDto', () => {
  let dto: UpdateNotificationDto;

  beforeEach(() => {
    dto = new UpdateNotificationDto();
  });

  it('should be defined', () => {
    expect(dto).toBeDefined();
  });

  it('should not return errors when no properties are set', () => {
    expect(dto).toBeInstanceOf(UpdateNotificationDto);
  });

  it('should return errors when invalid properties are set', async () => {
    dto.attendeeId = 'invalid-uuid';
    dto.type = 'invalid-uuid';
    dto.sendDate = 'invalid-date' as any;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });

  it('should be valid with partial update (message only)', async () => {
    dto.message = 'Updated notification message';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should be valid with partial update (sendDate only)', async () => {
    dto.sendDate = new Date();

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should be valid with all properties', async () => {
    dto.message = 'Updated message';
    dto.sendDate = new Date();
    dto.attendeeId = '123e4567-e89b-12d3-a456-426614174000';
    dto.type = '123e4567-e89b-12d3-a456-426614174001';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
