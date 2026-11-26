import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePedidoDto {
  @IsInt({ message: 'El id del usuario debe ser un número entero' })
  @IsPositive({ message: 'El id del usuario debe ser mayor a 0' })
  id_usuario: number;

  @IsOptional()
  @IsString({ message: 'Las notas deben ser texto' })
  @MaxLength(255, { message: 'Las notas pueden tener hasta 255 caracteres' })
  notas?: string;
}
