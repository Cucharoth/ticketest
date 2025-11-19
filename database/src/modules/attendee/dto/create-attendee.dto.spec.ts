import { validate } from 'class-validator';
import { CreateAttendeeDto } from './create-attendee.dto';

describe('CreateAttendeDto', () => {
  let dto: CreateAttendeeDto;

  beforeEach(() => {
    dto = new CreateAttendeeDto();
  });

  it('should be defined', () => {
    expect(dto).toBeDefined();
  });

  it('should have name, email, and cellphone properties', async () => {
    dto.name = 'John Doe';
    dto.email = '';
    dto.cellphone = '+1234567890';

    expect(dto.name).toBe('John Doe');
    expect(dto.email).toBe('');
    expect(dto.cellphone).toBe('+1234567890');

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(1);
  });

  it('should be valid with correct properties', async () => {
    dto.name = 'John Doe';
    dto.email = 'c.kirmauyr01@ufromail.cl';
    dto.cellphone = '+1234567890';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should be invalid with incorrect email', async () => {
    dto.name = 'John Doe';
    dto.email = 'invalid-email';
    dto.cellphone = '+1234567890';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should be invalid with incorrect cellphone', async () => {
    dto.name = 'John Doe';
    dto.email = 'c.kirmayr01@ufromail.cl';
    dto.cellphone = 'invalid-phone';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
