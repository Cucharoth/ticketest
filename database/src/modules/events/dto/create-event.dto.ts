import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  place: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  ticketMax: number;

  @IsUUID()
  @IsNotEmpty()
  typeId: string;
}
