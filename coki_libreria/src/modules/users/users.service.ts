import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const SALT_ROUNDS = 10;
const SIN_CONTRASENA = { contrasena: true } as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { nombre, correo, contrasena, telefono, rol } = createUserDto;

    try {
      return await this.prisma.usuarios.create({
        data: {
          nombre,
          correo,
          telefono,
          rol,
          contrasena: await bcrypt.hash(contrasena, SALT_ROUNDS),
        },
        omit: SIN_CONTRASENA,
      });
    } catch (error) {
      this.manejarCorreoRepetido(error);
      throw error;
    }
  }

  findAll() {
    return this.prisma.usuarios.findMany({ omit: SIN_CONTRASENA });
  }

  async findOne(id: number) {
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id_usuario: id },
      omit: SIN_CONTRASENA,
    });

    if (!usuario) {
      throw new NotFoundException(`No existe el usuario con id ${id}`);
    }

    return usuario;
  }

  findByCorreo(correo: string) {
    return this.prisma.usuarios.findUnique({ where: { correo } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    const { nombre, correo, contrasena, telefono, rol } = updateUserDto;
    const data = {
      nombre,
      correo,
      telefono,
      rol,
      contrasena: contrasena
        ? await bcrypt.hash(contrasena, SALT_ROUNDS)
        : undefined,
    };

    try {
      return await this.prisma.usuarios.update({
        where: { id_usuario: id },
        data,
        omit: SIN_CONTRASENA,
      });
    } catch (error) {
      this.manejarCorreoRepetido(error);
      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      return await this.prisma.usuarios.delete({
        where: { id_usuario: id },
        omit: SIN_CONTRASENA,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'No se puede eliminar el usuario porque tiene pedidos registrados',
        );
      }
      throw error;
    }
  }

  private manejarCorreoRepetido(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('El correo ya está registrado');
    }
  }
}
