import { validate } from 'class-validator';
import { UpdateAttendeeDto } from './update-attendee.dto';

describe('UpdateAttendeeDto', () => {
  let dto: UpdateAttendeeDto;

  beforeEach(() => {
    dto = new UpdateAttendeeDto();
  });

  it('should be defined', () => {
    expect(dto).toBeDefined();
  });

  it('should not return errors when no properties are set', () => {
    expect(dto).toBeInstanceOf(UpdateAttendeeDto);
  });

  it('should return errors when invalid properties are set', async () => {
    dto.email = 'invalid-email';
    dto.cellphone = 'invalid-phone';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });
});
