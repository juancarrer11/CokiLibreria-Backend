import { PickType } from '@nestjs/mapped-types';
import { CreateCarritoDto } from './create-carrito.dto';

export class UpdateCarritoDto extends PickType(CreateCarritoDto, [
  'cantidad',
] as const) {}
