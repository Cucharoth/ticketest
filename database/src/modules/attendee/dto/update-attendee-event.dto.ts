import { PartialType } from '@nestjs/mapped-types';
import { CreateAttendeeEventDto } from './create-attendee-event.dto';

export class UpdateAttendeeEventDto extends PartialType(
  CreateAttendeeEventDto,
) {}
