import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsOptional } from 'class-validator';
import { CreatePedidoDto } from './create-pedido.dto';

export const ESTADOS_PEDIDO = [
  'Pendiente',
  'En preparación',
  'Listo',
  'Entregado',
  'Cancelado',
];

// El estado solo se cambia al modificar el pedido (lo hace el admin desde el panel).
export class UpdatePedidoDto extends PartialType(CreatePedidoDto) {
  @IsOptional()
  @IsIn(ESTADOS_PEDIDO, {
    message: `El estado debe ser uno de: ${ESTADOS_PEDIDO.join(', ')}`,
  })
  estado?: string;
}
