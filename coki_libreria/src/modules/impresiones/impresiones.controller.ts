import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ImpresionesService } from './impresiones.service';
import { CreateImpresionDto } from './dto/create-impresion.dto';
import { UpdateImpresionDto } from './dto/update-impresion.dto';

@Controller('impresiones')
export class ImpresionesController {
  constructor(private readonly impresionesService: ImpresionesService) {}

  @Post()
  create(@Body() createImpresionDto: CreateImpresionDto) {
    return this.impresionesService.create(createImpresionDto);
  }

  @Get()
  findAll() {
    return this.impresionesService.findAll();
  }

  @Get('pedido/:id_pedido')
  findByPedido(@Param('id_pedido', ParseIntPipe) id_pedido: number) {
    return this.impresionesService.findByPedido(id_pedido);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.impresionesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateImpresionDto: UpdateImpresionDto,
  ) {
    return this.impresionesService.update(id, updateImpresionDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.impresionesService.remove(id);
  }
}
