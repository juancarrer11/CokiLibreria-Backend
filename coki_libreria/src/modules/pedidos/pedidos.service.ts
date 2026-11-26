import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomInt } from 'crypto';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';

const ESTADO_PENDIENTE = 'Pendiente';
const ESTADO_ENTREGADO = 'Entregado';
const ESTADO_CANCELADO = 'Cancelado';
const CARACTERES_RETIRO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const DETALLE_COMPLETO = {
  estados_pedido: { select: { nombre: true } },
  usuarios: { select: { id_usuario: true, nombre: true, correo: true } },
  detalle_pedido: {
    include: { productos: { select: { nombre: true } } },
    orderBy: { id_detalle: 'asc' },
  },
} as const;

type PedidoCompleto = Prisma.pedidosGetPayload<{
  include: typeof DETALLE_COMPLETO;
}>;

type Transaccion = Prisma.TransactionClient;

@Injectable()
export class PedidosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPedidoDto: CreatePedidoDto) {
    const { id_usuario, notas } = createPedidoDto;

    const pedido = await this.prisma.$transaction(async (tx) => {
      await this.verificarUsuario(tx, id_usuario);

      const carrito = await tx.carrito.findMany({
        where: { id_usuario },
        include: { productos: true },
      });

      if (carrito.length === 0) {
        throw new BadRequestException(
          'El carrito está vacío: agregá productos antes de confirmar el pedido',
        );
      }

      for (const item of carrito) {
        const actualizado = await tx.productos.updateMany({
          where: {
            id_producto: item.id_producto,
            stock: { gte: item.cantidad },
          },
          data: { stock: { decrement: item.cantidad } },
        });

        if (actualizado.count === 0) {
          throw new BadRequestException(
            `No hay stock suficiente de ${item.productos.nombre}: ${this.textoStock(item.productos.stock)}`,
          );
        }
      }

      const pendiente = await this.buscarEstadoPorNombre(tx, ESTADO_PENDIENTE);

      const nuevo = await tx.pedidos.create({
        data: {
          numero_retiro: await this.generarNumeroRetiro(tx),
          id_usuario,
          fecha: this.fechaDeHoy(),
          id_estado: pendiente.id_estado,
          notas,
          detalle_pedido: {
            create: carrito.map((item) => ({
              id_producto: item.id_producto,
              cantidad: item.cantidad,
              precio_unitario: item.productos.precio,
            })),
          },
        },
        include: DETALLE_COMPLETO,
      });

      await tx.carrito.deleteMany({ where: { id_usuario } });

      return nuevo;
    });

    return this.formatear(pedido);
  }

  async findAll() {
    const pedidos = await this.prisma.pedidos.findMany({
      include: DETALLE_COMPLETO,
      orderBy: { id_pedido: 'desc' },
    });
    return pedidos.map((pedido) => this.formatear(pedido));
  }

  async findByUsuario(id_usuario: number) {
    await this.verificarUsuario(this.prisma, id_usuario);

    const pedidos = await this.prisma.pedidos.findMany({
      where: { id_usuario },
      include: DETALLE_COMPLETO,
      orderBy: { id_pedido: 'desc' },
    });
    return pedidos.map((pedido) => this.formatear(pedido));
  }

  async findOne(id: number) {
    return this.formatear(await this.buscarPedido(this.prisma, id));
  }

  async update(id: number, updatePedidoDto: UpdatePedidoDto) {
    const { id_estado, notas } = updatePedidoDto;

    const pedido = await this.prisma.$transaction(async (tx) => {
      const actual = await this.buscarPedido(tx, id);

      if (id_estado !== undefined && id_estado !== actual.id_estado) {
        const nuevoEstado = await tx.estados_pedido.findUnique({
          where: { id_estado },
        });

        if (!nuevoEstado) {
          throw new BadRequestException('El estado indicado no existe');
        }

        const estadoActual = actual.estados_pedido.nombre;

        if (estadoActual === ESTADO_CANCELADO) {
          throw new BadRequestException(
            'No se puede cambiar el estado de un pedido cancelado',
          );
        }

        if (
          estadoActual === ESTADO_ENTREGADO &&
          nuevoEstado.nombre === ESTADO_CANCELADO
        ) {
          throw new BadRequestException(
            'No se puede cancelar un pedido que ya fue entregado',
          );
        }

        if (nuevoEstado.nombre === ESTADO_CANCELADO) {
          await this.devolverStock(tx, actual);
        }
      }

      return tx.pedidos.update({
        where: { id_pedido: id },
        data: { id_estado, notas },
        include: DETALLE_COMPLETO,
      });
    });

    return this.formatear(pedido);
  }

  async remove(id: number) {
    const pedido = await this.prisma.$transaction(async (tx) => {
      const actual = await this.buscarPedido(tx, id);
      const estado = actual.estados_pedido.nombre;

      if (estado !== ESTADO_CANCELADO && estado !== ESTADO_ENTREGADO) {
        await this.devolverStock(tx, actual);
      }

      await tx.pedidos.delete({ where: { id_pedido: id } });
      return actual;
    });

    return this.formatear(pedido);
  }

  private async buscarPedido(db: Transaccion, id: number) {
    const pedido = await db.pedidos.findUnique({
      where: { id_pedido: id },
      include: DETALLE_COMPLETO,
    });

    if (!pedido) {
      throw new NotFoundException(`No existe el pedido con id ${id}`);
    }

    return pedido;
  }

  private async verificarUsuario(db: Transaccion, id_usuario: number) {
    const usuario = await db.usuarios.findUnique({
      where: { id_usuario },
      select: { id_usuario: true },
    });

    if (!usuario) {
      throw new NotFoundException(`No existe el usuario con id ${id_usuario}`);
    }
  }

  private async buscarEstadoPorNombre(db: Transaccion, nombre: string) {
    const estado = await db.estados_pedido.findUnique({ where: { nombre } });

    if (!estado) {
      throw new NotFoundException(`No existe el estado ${nombre}`);
    }

    return estado;
  }

  private async devolverStock(db: Transaccion, pedido: PedidoCompleto) {
    for (const item of pedido.detalle_pedido) {
      await db.productos.update({
        where: { id_producto: item.id_producto },
        data: { stock: { increment: item.cantidad } },
      });
    }
  }

  private async generarNumeroRetiro(db: Transaccion) {
    for (let intento = 0; intento < 10; intento++) {
      let codigo = 'R-';
      for (let i = 0; i < 6; i++) {
        codigo += CARACTERES_RETIRO[randomInt(CARACTERES_RETIRO.length)];
      }

      const existe = await db.pedidos.findUnique({
        where: { numero_retiro: codigo },
        select: { id_pedido: true },
      });

      if (!existe) {
        return codigo;
      }
    }

    throw new BadRequestException(
      'No se pudo generar el número de retiro, intentá de nuevo',
    );
  }

  private fechaDeHoy() {
    const hoy = new Date();
    return new Date(Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()));
  }

  private formatear(pedido: PedidoCompleto) {
    const items = pedido.detalle_pedido.map((item) => {
      const precio = Number(item.precio_unitario);
      return {
        id_detalle: item.id_detalle,
        id_producto: item.id_producto,
        producto: item.productos.nombre,
        cantidad: item.cantidad,
        precio_unitario: precio,
        subtotal: this.redondear(precio * item.cantidad),
      };
    });

    return {
      id_pedido: pedido.id_pedido,
      numero_retiro: pedido.numero_retiro,
      fecha: pedido.fecha.toISOString().slice(0, 10),
      id_estado: pedido.id_estado,
      estado: pedido.estados_pedido.nombre,
      usuario: pedido.usuarios,
      notas: pedido.notas,
      items,
      total: this.redondear(
        items.reduce((suma, item) => suma + item.subtotal, 0),
      ),
    };
  }

  private textoStock(stock: number) {
    return stock === 1 ? 'queda 1 unidad' : `quedan ${stock} unidades`;
  }

  private redondear(valor: number) {
    return Math.round(valor * 100) / 100;
  }
}
