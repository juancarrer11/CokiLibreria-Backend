import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  Max,
  Min,
} from 'class-validator';

export class ActualizarPreciosDto {
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El porcentaje debe ser un número con hasta 2 decimales' },
  )
  @Min(-99.99, { message: 'El porcentaje debe ser mayor a -100' })
  @Max(100, { message: 'El porcentaje no puede ser mayor a 100' })
  porcentaje?: number;

  @IsOptional()
  @IsIn([1, 10, 50, 100], { message: 'El redondeo debe ser 1, 10, 50 o 100' })
  redondeo?: number;

  @IsOptional()
  @IsInt({ message: 'El id de la categoría debe ser un número entero' })
  @IsPositive({ message: 'El id de la categoría debe ser mayor a 0' })
  id_categoria?: number;

  @IsOptional()
  @IsArray({ message: 'Los productos deben ser una lista de ids' })
  @ArrayNotEmpty({ message: 'Hay que elegir al menos un producto' })
  @ArrayUnique({ message: 'Hay productos repetidos' })
  @IsInt({
    each: true,
    message: 'Cada id de producto debe ser un número entero',
  })
  @IsPositive({ each: true, message: 'Cada id de producto debe ser mayor a 0' })
  id_productos?: number[];
}
