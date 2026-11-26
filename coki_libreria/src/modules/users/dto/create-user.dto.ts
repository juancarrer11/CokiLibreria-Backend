import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Length(3, 80, { message: 'El nombre debe tener entre 3 y 80 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, {
    message: 'El nombre solo puede contener letras y espacios',
  })
  nombre: string;

  @IsEmail({}, { message: 'El correo no es válido' })
  @MaxLength(120, { message: 'El correo puede tener hasta 120 caracteres' })
  correo: string;

  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial',
    },
  )
  contrasena: string;

  @IsOptional()
  @IsPhoneNumber('AR', { message: 'El teléfono no es válido' })
  telefono?: string;

  @IsOptional()
  @IsIn(['cliente', 'admin'], { message: 'El rol debe ser cliente o admin' })
  rol?: 'cliente' | 'admin';
}
