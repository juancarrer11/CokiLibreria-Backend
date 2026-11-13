import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateImpresionDto {
  @IsIn(['byn', 'color'], {
    message: 'El tipo de impresión debe ser byn o color',
  })
  tipoImpresion: string;

  @IsIn(['comun', 'fotografico', 'adhesivo'], {
    message: 'El tipo de papel debe ser comun, fotografico o adhesivo',
  })
  tipoPapel: string;

  @IsInt({ message: 'La cantidad de copias debe ser un número entero' })
  @Min(1, { message: 'La cantidad mínima es 1 copia' })
  @Max(500, { message: 'La cantidad máxima es 500 copias' })
  cantidad: number;

  @IsString({ message: 'El nombre del archivo debe ser texto' })
  @IsNotEmpty({ message: 'El archivo es obligatorio' })
  archivo: string;

  @IsOptional()
  @IsUrl({}, { message: 'La URL del archivo no es válida' })
  archivoUrl?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  @MaxLength(255, {
    message: 'La descripción puede tener hasta 255 caracteres',
  })
  descripcion?: string;
}
