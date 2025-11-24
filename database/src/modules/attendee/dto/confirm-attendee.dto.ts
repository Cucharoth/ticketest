import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class ConfirmAttendeeDto {
    @IsString()
    @IsNotEmpty()
    attendeeId: string;

    @IsString()
    @IsNotEmpty()
    eventId: string;

    @IsBoolean()
    @IsNotEmpty()
    confirmed: boolean;   
}