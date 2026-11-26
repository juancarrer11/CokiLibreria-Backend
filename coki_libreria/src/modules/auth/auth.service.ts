import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  register(registerDto: RegisterDto) {
    const { nombre, correo, contrasena, telefono } = registerDto;
    return this.usersService.create({
      nombre,
      correo,
      contrasena,
      telefono,
      rol: 'cliente',
    });
  }

  async login(loginDto: LoginDto) {
    const usuario = await this.usersService.findByCorreo(loginDto.correo);

    const contrasenaValida =
      usuario &&
      (await bcrypt.compare(loginDto.contrasena, usuario.contrasena));

    if (!usuario || !contrasenaValida) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: usuario.id_usuario,
      correo: usuario.correo,
      rol: usuario.rol,
    });

    return {
      accessToken,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    };
  }
}
