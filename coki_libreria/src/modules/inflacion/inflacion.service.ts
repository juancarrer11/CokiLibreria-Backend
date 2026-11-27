import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ActualizarPreciosDto } from './dto/actualizar-precios.dto';

type MesInflacion = { fecha: string; valor: number };

const MAXIMO_MESES = 24;

@Injectable()
export class InflacionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async obtenerHistorial(meses: number) {
    if (meses < 1 || meses > MAXIMO_MESES) {
      throw new BadRequestException(
        `La cantidad de meses debe estar entre 1 y ${MAXIMO_MESES}`,
      );
    }

    const historial = (await this.consultarApi()).slice(-meses);
    const ultimo = historial[historial.length - 1];
    const acumulada =
      (historial.reduce((total, mes) => total * (1 + mes.valor / 100), 1) - 1) *
      100;

    return {
      ultimo_mes: this.formatearMes(ultimo),
      inflacion_acumulada: Math.round(acumulada * 100) / 100,
      meses: historial.map((mes) => this.formatearMes(mes)),
    };
  }

  async actualizarPrecios(actualizarPreciosDto: ActualizarPreciosDto) {
    const { id_categoria, id_productos, redondeo = 1 } = actualizarPreciosDto;
    const porcentaje =
      actualizarPreciosDto.porcentaje ?? (await this.ultimoMes()).valor;

    if (id_categoria !== undefined) {
      const categoria = await this.prisma.categorias.findUnique({
        where: { id_categoria },
      });
      if (!categoria) {
        throw new NotFoundException(
          `No existe la categoría con id ${id_categoria}`,
        );
      }
    }

    const filtro: Prisma.productosWhereInput = {
      id_categoria,
      id_producto: id_productos ? { in: id_productos } : undefined,
    };
    const productos = await this.prisma.productos.findMany({
      where: filtro,
      orderBy: { id_producto: 'asc' },
    });

    if (id_productos) {
      const encontrados = new Set(productos.map((p) => p.id_producto));
      const faltantes = id_productos.filter((id) => !encontrados.has(id));
      if (faltantes.length > 0 && id_categoria === undefined) {
        throw new NotFoundException(
          `No existen los productos con id ${faltantes.join(', ')}`,
        );
      }
    }

    if (productos.length === 0) {
      throw new BadRequestException(
        'No hay productos que coincidan con el filtro',
      );
    }

    const cambios = productos.map((producto) => {
      const anterior = Number(producto.precio);
      const nuevo =
        Math.round((anterior * (1 + porcentaje / 100)) / redondeo) * redondeo;
      return {
        id_producto: producto.id_producto,
        nombre: producto.nombre,
        precio_anterior: anterior,
        precio_nuevo: nuevo,
      };
    });

    const invalido = cambios.find((cambio) => cambio.precio_nuevo <= 0);
    if (invalido) {
      throw new BadRequestException(
        `El precio de ${invalido.nombre} quedaría en $${invalido.precio_nuevo}: elegí otro porcentaje o redondeo`,
      );
    }

    await this.prisma.$transaction(
      cambios.map((cambio) =>
        this.prisma.productos.update({
          where: { id_producto: cambio.id_producto },
          data: { precio: cambio.precio_nuevo },
        }),
      ),
    );

    return {
      porcentaje,
      redondeo,
      productos_actualizados: cambios.length,
      productos: cambios,
    };
  }

  private async ultimoMes() {
    const historial = await this.consultarApi();
    return historial[historial.length - 1];
  }

  private async consultarApi(): Promise<MesInflacion[]> {
    const url = this.configService.getOrThrow<string>('INFLACION_API_URL');

    let datos: unknown;
    try {
      const respuesta = await fetch(url, {
        signal: AbortSignal.timeout(10000),
      });
      if (!respuesta.ok) {
        throw new Error(`La API respondió ${respuesta.status}`);
      }
      datos = await respuesta.json();
    } catch {
      throw new ServiceUnavailableException(
        'No se pudo obtener la inflación desde ArgentinaDatos. Probá de nuevo más tarde',
      );
    }

    if (!Array.isArray(datos) || datos.length === 0) {
      throw new ServiceUnavailableException(
        'ArgentinaDatos devolvió datos con un formato inesperado',
      );
    }

    return datos as MesInflacion[];
  }

  private formatearMes(mes: MesInflacion) {
    const nombre = new Date(`${mes.fecha}T00:00:00`).toLocaleDateString(
      'es-AR',
      { month: 'long', year: 'numeric' },
    );
    return { fecha: mes.fecha, mes: nombre, valor: mes.valor };
  }
}
