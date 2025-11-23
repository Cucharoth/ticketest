import { validate } from 'class-validator';
import { CreateNotificationDto } from './create-notification.dto';

describe('CreateNotificationDto', () => {
  let dto: CreateNotificationDto;

  beforeEach(() => {
    dto = new CreateNotificationDto();
  });

  it('should be defined', () => {
    expect(dto).toBeDefined();
  });

  it('should have message, sendDate, attendeeId, and type properties', () => {
    dto.message = 'Test notification message';
    dto.sendDate = new Date();
    dto.attendeeId = '123e4567-e89b-12d3-a456-426614174000';
    dto.type = '123e4567-e89b-12d3-a456-426614174001';

    expect(dto.message).toBe('Test notification message');
    expect(dto.sendDate).toBeInstanceOf(Date);
    expect(dto.attendeeId).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(dto.type).toBe('123e4567-e89b-12d3-a456-426614174001');
  });

  it('should be valid with correct properties', async () => {
    dto.message = 'Your ticket has been confirmed';
    dto.sendDate = new Date();
    dto.attendeeId = '123e4567-e89b-12d3-a456-426614174000';
    dto.type = '123e4567-e89b-12d3-a456-426614174001';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should be invalid with empty message', async () => {
    dto.message = '';
    dto.sendDate = new Date();
    dto.attendeeId = '123e4567-e89b-12d3-a456-426614174000';
    dto.type = '123e4567-e89b-12d3-a456-426614174001';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  it('should be invalid with invalid sendDate', async () => {
    dto.message = 'Test message';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    dto.sendDate = 'invalid-date' as any;
    dto.attendeeId = '123e4567-e89b-12d3-a456-426614174000';
    dto.type = '123e4567-e89b-12d3-a456-426614174001';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  it('should be invalid with invalid attendeeId UUID', async () => {
    dto.message = 'Test message';
    dto.sendDate = new Date();
    dto.attendeeId = 'invalid-uuid';
    dto.type = '123e4567-e89b-12d3-a456-426614174001';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  it('should be invalid with invalid type UUID', async () => {
    dto.message = 'Test message';
    dto.sendDate = new Date();
    dto.attendeeId = '123e4567-e89b-12d3-a456-426614174000';
    dto.type = 'invalid-uuid';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  it('should be invalid when message is missing', async () => {
    dto.sendDate = new Date();
    dto.attendeeId = '123e4567-e89b-12d3-a456-426614174000';
    dto.type = '123e4567-e89b-12d3-a456-426614174001';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  it('should be invalid when sendDate is missing', async () => {
    dto.message = 'Test message';
    dto.attendeeId = '123e4567-e89b-12d3-a456-426614174000';
    dto.type = '123e4567-e89b-12d3-a456-426614174001';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  it('should be invalid when attendeeId is missing', async () => {
    dto.message = 'Test message';
    dto.sendDate = new Date();
    dto.type = '123e4567-e89b-12d3-a456-426614174001';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  it('should be invalid when type is missing', async () => {
    dto.message = 'Test message';
    dto.sendDate = new Date();
    dto.attendeeId = '123e4567-e89b-12d3-a456-426614174000';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });
});
