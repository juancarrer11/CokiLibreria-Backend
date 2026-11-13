import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
export class ActualizarPreciosDto {
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El porcentaje debe ser un número con hasta 2 decimales' },
  )
  @Min(-99.99, { message: 'El porcentaje debe ser mayor a -100' })
  @Max(100, { message: 'El porcentaje no puede ser mayor a 100' })
  porcentaje: number;

  @IsOptional()
  @IsIn([1, 10, 50, 100], { message: 'El redondeo debe ser 1, 10, 50 o 100' })
  redondeo?: number;

  @IsOptional()
  @IsString({ message: 'La categoría debe ser texto' })
  categoria?: string;

  @IsOptional()
  @IsArray({ message: 'Los productos deben ser una lista de ids' })
  @ArrayNotEmpty({ message: 'Hay que elegir al menos un producto' })
  @ArrayUnique({ message: 'Hay productos repetidos' })
  @IsInt({
    each: true,
    message: 'Cada id de producto debe ser un número entero',
  })
  productosIds?: number[];
}
