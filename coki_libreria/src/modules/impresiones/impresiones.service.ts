import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { impresiones } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateImpresionDto } from './dto/create-impresion.dto';
import { UpdateImpresionDto } from './dto/update-impresion.dto';
import {
  PRECIO_POR_COPIA,
  TIPOS_IMPRESION,
  TIPOS_PAPEL,
  nombreTipoImpresion,
  nombreTipoPapel,
} from './impresiones.opciones';

const ESTADOS_CERRADOS = ['Entregado', 'Cancelado'];

@Injectable()
export class ImpresionesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createImpresionDto: CreateImpresionDto) {
    const {
      id_pedido,
      tipo_impresion,
      tipo_papel,
      cantidad_copias,
      archivo,
      descripcion,
    } = createImpresionDto;

    await this.verificarPedidoAbierto(id_pedido);

    const tipo = TIPOS_IMPRESION[tipo_impresion];
    const impresion = await this.prisma.impresiones.create({
      data: {
        id_pedido,
        tipo_impresion: tipo,
        tipo_papel: TIPOS_PAPEL[tipo_papel],
        cantidad_copias,
        precio_unitario: PRECIO_POR_COPIA[tipo],
        archivo,
        descripcion,
      },
    });
    return this.formatear(impresion);
  }

  async findAll() {
    const impresiones = await this.prisma.impresiones.findMany({
      orderBy: { id_impresion: 'asc' },
    });
    return impresiones.map((impresion) => this.formatear(impresion));
  }

  async findByPedido(id_pedido: number) {
    await this.buscarPedido(id_pedido);

    const impresiones = await this.prisma.impresiones.findMany({
      where: { id_pedido },
      orderBy: { id_impresion: 'asc' },
    });
    return impresiones.map((impresion) => this.formatear(impresion));
  }

  async findOne(id: number) {
    return this.formatear(await this.buscarImpresion(id));
  }

  async update(id: number, updateImpresionDto: UpdateImpresionDto) {
    const actual = await this.buscarImpresion(id);
    await this.verificarPedidoAbierto(actual.id_pedido);

    const {
      tipo_impresion,
      tipo_papel,
      cantidad_copias,
      archivo,
      descripcion,
    } = updateImpresionDto;
    const tipo = tipo_impresion ? TIPOS_IMPRESION[tipo_impresion] : undefined;

    const impresion = await this.prisma.impresiones.update({
      where: { id_impresion: id },
      data: {
        tipo_impresion: tipo,
        tipo_papel: tipo_papel ? TIPOS_PAPEL[tipo_papel] : undefined,
        cantidad_copias,
        precio_unitario: tipo ? PRECIO_POR_COPIA[tipo] : undefined,
        archivo,
        descripcion,
      },
    });
    return this.formatear(impresion);
  }

  async remove(id: number) {
    const actual = await this.buscarImpresion(id);
    await this.verificarPedidoAbierto(actual.id_pedido);

    const impresion = await this.prisma.impresiones.delete({
      where: { id_impresion: id },
    });
    return this.formatear(impresion);
  }

  private async buscarImpresion(id: number) {
    const impresion = await this.prisma.impresiones.findUnique({
      where: { id_impresion: id },
    });

    if (!impresion) {
      throw new NotFoundException(`No existe la impresión con id ${id}`);
    }

    return impresion;
  }

  private async buscarPedido(id_pedido: number) {
    const pedido = await this.prisma.pedidos.findUnique({
      where: { id_pedido },
      select: { estados_pedido: { select: { nombre: true } } },
    });

    if (!pedido) {
      throw new NotFoundException(`No existe el pedido con id ${id_pedido}`);
    }

    return pedido;
  }

  private async verificarPedidoAbierto(id_pedido: number) {
    const pedido = await this.buscarPedido(id_pedido);
    const estado = pedido.estados_pedido.nombre;

    if (ESTADOS_CERRADOS.includes(estado)) {
      throw new BadRequestException(
        `No se pueden modificar las impresiones de un pedido ${estado.toLowerCase()}`,
      );
    }
  }

  private formatear(impresion: impresiones) {
    const precio = Number(impresion.precio_unitario);

    return {
      id_impresion: impresion.id_impresion,
      id_pedido: impresion.id_pedido,
      tipo_impresion: nombreTipoImpresion(impresion.tipo_impresion),
      tipo_papel: nombreTipoPapel(impresion.tipo_papel),
      cantidad_copias: impresion.cantidad_copias,
      precio_unitario: precio,
      subtotal: Math.round(precio * impresion.cantidad_copias * 100) / 100,
      archivo: impresion.archivo,
      descripcion: impresion.descripcion,
    };
  }
}
