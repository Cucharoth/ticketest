import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';

@Module({
  imports: [],
  providers: [TicketService],
  exports: [TicketService],
  controllers: [TicketController],
})
export class TicketModule {}
