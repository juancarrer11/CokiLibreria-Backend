import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  TIPOS_IMPRESION,
  TIPOS_PAPEL,
  type NombreTipoImpresion,
  type NombreTipoPapel,
} from '../impresiones.opciones';

const NOMBRES_IMPRESION = Object.keys(TIPOS_IMPRESION);
const NOMBRES_PAPEL = Object.keys(TIPOS_PAPEL);

export class CreateImpresionDto {
  @IsInt({ message: 'El id del pedido debe ser un número entero' })
  @IsPositive({ message: 'El id del pedido debe ser mayor a 0' })
  id_pedido: number;

  @IsIn(NOMBRES_IMPRESION, {
    message: `El tipo de impresión debe ser: ${NOMBRES_IMPRESION.join(' o ')}`,
  })
  tipo_impresion: NombreTipoImpresion;

  @IsIn(NOMBRES_PAPEL, {
    message: `El tipo de papel debe ser: ${NOMBRES_PAPEL.join(', ')}`,
  })
  tipo_papel: NombreTipoPapel;

  @IsInt({ message: 'La cantidad de copias debe ser un número entero' })
  @Min(1, { message: 'La cantidad mínima es 1 copia' })
  @Max(500, { message: 'La cantidad máxima es 500 copias' })
  cantidad_copias: number;

  @IsString({ message: 'El nombre del archivo debe ser texto' })
  @IsNotEmpty({ message: 'El archivo es obligatorio' })
  @MaxLength(150, {
    message: 'El nombre del archivo puede tener hasta 150 caracteres',
  })
  archivo: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  @MaxLength(255, {
    message: 'La descripción puede tener hasta 255 caracteres',
  })
  descripcion?: string;
}
