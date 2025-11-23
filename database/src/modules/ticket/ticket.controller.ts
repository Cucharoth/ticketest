import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket } from '@prisma/client';

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateTicketDto): Promise<Ticket> {
    return await this.ticketService.create(dto);
  }

  @Get()
  @HttpCode(200)
  async findAll(): Promise<Ticket[]> {
    return await this.ticketService.findAll();
  }

  @Get(':id')
  @HttpCode(200)
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Ticket> {
    return await this.ticketService.findOne(id);
  }

  @Get('type/:typeId')
  @HttpCode(200)
  async findByTypeId(
    @Param('typeId', ParseUUIDPipe) typeId: string,
  ): Promise<Ticket[]> {
    return await this.ticketService.findByTypeId(typeId);
  }

  @Patch(':id')
  @HttpCode(200)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTicketDto,
  ): Promise<Ticket> {
    return await this.ticketService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<Ticket> {
    return await this.ticketService.remove(id);
  }
}
