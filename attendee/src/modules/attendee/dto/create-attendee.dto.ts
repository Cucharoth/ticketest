import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateAttendeeDto {
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
}
