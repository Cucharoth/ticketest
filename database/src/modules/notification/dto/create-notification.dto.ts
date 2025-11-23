import { IsNotEmpty, IsString, IsDate, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  sendDate: Date;

  @IsNotEmpty()
  @IsUUID()
  attendeeId: string;

  @IsNotEmpty()
  @IsUUID()
  type: string;
}
