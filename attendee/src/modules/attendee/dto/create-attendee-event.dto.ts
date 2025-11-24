import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateAttendeeEventDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[\d\s+\-()]+$/, {
    message: 'Cellphone must be a valid phone number',
  })
  cellphone: string;

  @IsNotEmpty()
  @IsString()
  eventId: string;

  @IsOptional()
  @IsBoolean()
  confirmed: boolean;
}
