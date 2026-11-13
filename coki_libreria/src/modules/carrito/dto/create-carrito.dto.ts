import { IsInt, IsPositive, Max, Min } from 'class-validator';

export class CreateCarritoDto {
  @IsInt({ message: 'El id del usuario debe ser un número entero' })
  @IsPositive({ message: 'El id del usuario debe ser mayor a 0' })
  usuarioId: number;

  @IsInt({ message: 'El id del producto debe ser un número entero' })
  @IsPositive({ message: 'El id del producto debe ser mayor a 0' })
  productoId: number;

  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad mínima es 1' })
  @Max(100, { message: 'La cantidad máxima es 100' })
  cantidad: number;
}
