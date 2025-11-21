import { validate } from 'class-validator';
import { UploadEventDto } from './upload-event.dto';

describe('UploadEventDto', () => {
  let dto: UploadEventDto;

  beforeEach(() => {
    dto = new UploadEventDto();
  });

  it('should be defined', () => {
    const dto = new UploadEventDto();
    expect(dto).toBeDefined();
  });

  it('should return no errors when no properties are set', async () => {
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should return errors for invalid properties', async () => {
    dto.name = '';
    dto.date = 'invalid-date';
    dto.place = '';
    dto.ticketMax = -10;
    dto.typeId = 'invalid-uuid';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThanOrEqual(6);
  });
});
