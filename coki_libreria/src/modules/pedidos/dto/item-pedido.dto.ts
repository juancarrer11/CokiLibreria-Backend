import { IsInt, IsPositive, Min } from 'class-validator';

// Cada producto que forma parte de un pedido.
export class ItemPedidoDto {
  @IsInt({ message: 'El id del producto debe ser un número entero' })
  @IsPositive({ message: 'El id del producto debe ser mayor a 0' })
  productoId: number;

  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad mínima es 1' })
  cantidad: number;
}
