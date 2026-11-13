import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductoDto {
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100, { message: 'El nombre puede tener hasta 100 caracteres' })
  nombre: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El precio debe ser un número con hasta 2 decimales' },
  )
  @IsPositive({ message: 'El precio debe ser mayor a 0' })
  precio: number;

  @IsString({ message: 'La categoría debe ser texto' })
  @IsNotEmpty({ message: 'La categoría es obligatoria' })
  @MaxLength(50, { message: 'La categoría puede tener hasta 50 caracteres' })
  categoria: string;

  @IsInt({ message: 'El stock debe ser un número entero' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock: number;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  @MaxLength(255, {
    message: 'La descripción puede tener hasta 255 caracteres',
  })
  descripcion?: string;

  @IsOptional()
  @IsUrl({}, { message: 'La imagen debe ser una URL válida' })
  imagen?: string;
}
