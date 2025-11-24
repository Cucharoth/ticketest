import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateAttendeeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[\d\s+\-()]+$/, {
    message: 'Cellphone must be a valid phone number',
  })
  cellphone: string;

  @IsBoolean()
  @IsOptional()
  confirmed?: boolean;
}
