import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';

export class CreateTicketDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01, { message: 'Price must be greater than 0' })
  price: number;

  @IsNotEmpty()
  @IsUUID()
  typeId: string;
}
