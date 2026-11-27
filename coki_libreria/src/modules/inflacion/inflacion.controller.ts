import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { InflacionService } from './inflacion.service';
import { ActualizarPreciosDto } from './dto/actualizar-precios.dto';

@Controller('inflacion')
export class InflacionController {
  constructor(private readonly inflacionService: InflacionService) {}

  @Get()
  obtenerHistorial(
    @Query('meses', new DefaultValuePipe(6), ParseIntPipe) meses: number,
  ) {
    return this.inflacionService.obtenerHistorial(meses);
  }

  @Post('actualizar-precios')
  @HttpCode(HttpStatus.OK)
  actualizarPrecios(@Body() actualizarPreciosDto: ActualizarPreciosDto) {
    return this.inflacionService.actualizarPrecios(actualizarPreciosDto);
  }
}
