import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCarritoDto } from './dto/create-carrito.dto';
import { UpdateCarritoDto } from './dto/update-carrito.dto';

const CON_PRODUCTO = {
  productos: { select: { nombre: true, precio: true, stock: true } },
} as const;

type ItemConProducto = Prisma.carritoGetPayload<{
  include: typeof CON_PRODUCTO;
}>;

@Injectable()
export class CarritoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCarritoDto: CreateCarritoDto) {
    const { id_usuario, id_producto, cantidad } = createCarritoDto;

    await this.verificarUsuario(id_usuario);
    const producto = await this.buscarProducto(id_producto);

    const existente = await this.prisma.carrito.findUnique({
      where: { id_usuario_id_producto: { id_usuario, id_producto } },
    });
    const cantidadTotal = (existente?.cantidad ?? 0) + cantidad;
    this.verificarStock(producto, cantidadTotal);

    const item = await this.prisma.carrito.upsert({
      where: { id_usuario_id_producto: { id_usuario, id_producto } },
      create: { id_usuario, id_producto, cantidad },
      update: { cantidad: cantidadTotal },
      include: CON_PRODUCTO,
    });
    return this.formatear(item);
  }

  async findAll() {
    const items = await this.prisma.carrito.findMany({
      include: CON_PRODUCTO,
      orderBy: { id_carrito: 'asc' },
    });
    return items.map((item) => this.formatear(item));
  }

  async findByUsuario(id_usuario: number) {
    await this.verificarUsuario(id_usuario);

    const items = await this.prisma.carrito.findMany({
      where: { id_usuario },
      include: CON_PRODUCTO,
      orderBy: { id_carrito: 'asc' },
    });
    const itemsFormateados = items.map((item) => this.formatear(item));
    const total = itemsFormateados.reduce(
      (suma, item) => suma + item.subtotal,
      0,
    );

    return {
      id_usuario,
      items: itemsFormateados,
      total: this.redondear(total),
    };
  }

  async findOne(id: number) {
    const item = await this.prisma.carrito.findUnique({
      where: { id_carrito: id },
      include: CON_PRODUCTO,
    });

    if (!item) {
      throw new NotFoundException(`No existe el ítem del carrito con id ${id}`);
    }

    return this.formatear(item);
  }

  async update(id: number, updateCarritoDto: UpdateCarritoDto) {
    const item = await this.findOne(id);
    const producto = await this.buscarProducto(item.id_producto);
    this.verificarStock(producto, updateCarritoDto.cantidad);

    const actualizado = await this.prisma.carrito.update({
      where: { id_carrito: id },
      data: { cantidad: updateCarritoDto.cantidad },
      include: CON_PRODUCTO,
    });
    return this.formatear(actualizado);
  }

  async remove(id: number) {
    await this.findOne(id);

    const eliminado = await this.prisma.carrito.delete({
      where: { id_carrito: id },
      include: CON_PRODUCTO,
    });
    return this.formatear(eliminado);
  }

  private async verificarUsuario(id_usuario: number) {
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id_usuario },
      select: { id_usuario: true },
    });

    if (!usuario) {
      throw new NotFoundException(`No existe el usuario con id ${id_usuario}`);
    }
  }

  private async buscarProducto(id_producto: number) {
    const producto = await this.prisma.productos.findUnique({
      where: { id_producto },
      select: { nombre: true, stock: true },
    });

    if (!producto) {
      throw new NotFoundException(
        `No existe el producto con id ${id_producto}`,
      );
    }

    return producto;
  }

  private verificarStock(
    producto: { nombre: string; stock: number },
    cantidad: number,
  ) {
    if (cantidad > producto.stock) {
      throw new BadRequestException(
        `No hay stock suficiente de ${producto.nombre}: ${this.textoStock(producto.stock)}`,
      );
    }
  }

  private formatear({ productos, ...item }: ItemConProducto) {
    const precio = Number(productos.precio);

    return {
      ...item,
      producto: {
        nombre: productos.nombre,
        precio,
        stock: productos.stock,
      },
      subtotal: this.redondear(precio * item.cantidad),
    };
  }

  private textoStock(stock: number) {
    return stock === 1 ? 'queda 1 unidad' : `quedan ${stock} unidades`;
  }

  private redondear(valor: number) {
    return Math.round(valor * 100) / 100;
  }
}
