import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.impresionesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateImpresionDto: UpdateImpresionDto,
  ) {
    return this.impresionesService.update(+id, updateImpresionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.impresionesService.remove(+id);
  }
}
