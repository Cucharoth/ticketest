import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEventTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
