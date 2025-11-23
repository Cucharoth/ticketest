import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateAttendeeEventDto {
  @IsNotEmpty()
  @IsUUID()
  eventId: string;

  @IsNotEmpty()
  @IsUUID()
  attendeeId: string;
}
