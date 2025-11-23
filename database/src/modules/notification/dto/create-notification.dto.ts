import { IsNotEmpty, IsString, IsDateString, IsUUID } from 'class-validator';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsDateString()
  sendDate: Date;

  @IsNotEmpty()
  @IsUUID()
  attendeeId: string;

  @IsNotEmpty()
  @IsUUID()
  type: string;
}
