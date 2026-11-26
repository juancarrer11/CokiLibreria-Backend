import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

const CON_CATEGORIA = { categorias: { select: { nombre: true } } } as const;

type ProductoConCategoria = Prisma.productosGetPayload<{
  include: typeof CON_CATEGORIA;
}>;

@Injectable()
export class ProductosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductoDto: CreateProductoDto) {
    const { nombre, descripcion, precio, stock, id_categoria } =
      createProductoDto;

    try {
      const producto = await this.prisma.productos.create({
        data: { nombre, descripcion, precio, stock, id_categoria },
        include: CON_CATEGORIA,
      });
      return this.formatear(producto);
    } catch (error) {
      this.manejarCategoriaInexistente(error);
      throw error;
    }
  }

  async findAll() {
    const productos = await this.prisma.productos.findMany({
      include: CON_CATEGORIA,
      orderBy: { id_producto: 'asc' },
    });
    return productos.map((producto) => this.formatear(producto));
  }

  async findOne(id: number) {
    const producto = await this.prisma.productos.findUnique({
      where: { id_producto: id },
      include: CON_CATEGORIA,
    });

    if (!producto) {
      throw new NotFoundException(`No existe el producto con id ${id}`);
    }

    return this.formatear(producto);
  }

  async update(id: number, updateProductoDto: UpdateProductoDto) {
    await this.findOne(id);

    const { nombre, descripcion, precio, stock, id_categoria } =
      updateProductoDto;

    try {
      const producto = await this.prisma.productos.update({
        where: { id_producto: id },
        data: { nombre, descripcion, precio, stock, id_categoria },
        include: CON_CATEGORIA,
      });
      return this.formatear(producto);
    } catch (error) {
      this.manejarCategoriaInexistente(error);
      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      const producto = await this.prisma.productos.delete({
        where: { id_producto: id },
        include: CON_CATEGORIA,
      });
      return this.formatear(producto);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'No se puede eliminar el producto porque está en pedidos registrados',
        );
      }
      throw error;
    }
  }

  private formatear({ categorias, precio, ...producto }: ProductoConCategoria) {
    return {
      ...producto,
      precio: Number(precio),
      categoria: categorias.nombre,
    };
  }

  private manejarCategoriaInexistente(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      throw new BadRequestException('La categoría indicada no existe');
    }
  }
}
