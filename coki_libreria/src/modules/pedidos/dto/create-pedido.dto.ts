import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ItemPedidoDto } from './item-pedido.dto';

// El cliente no manda el estado: todo pedido nuevo arranca como "Pendiente".
export class CreatePedidoDto {
  @IsString({ message: 'El nombre del cliente debe ser texto' })
  @IsNotEmpty({ message: 'El nombre del cliente es obligatorio' })
  @Length(3, 100, {
    message: 'El nombre del cliente debe tener entre 3 y 100 caracteres',
  })
  cliente: string;

  @IsPhoneNumber('AR', { message: 'El teléfono no es válido' })
  telefono: string;

  @IsArray({ message: 'Los items deben ser una lista' })
  @ArrayNotEmpty({ message: 'El pedido debe tener al menos un producto' })
  @ValidateNested({ each: true })
  @Type(() => ItemPedidoDto)
  items: ItemPedidoDto[];

  @IsOptional()
  @IsString({ message: 'Las notas deben ser texto' })
  @MaxLength(255, { message: 'Las notas pueden tener hasta 255 caracteres' })
  notas?: string;
}
