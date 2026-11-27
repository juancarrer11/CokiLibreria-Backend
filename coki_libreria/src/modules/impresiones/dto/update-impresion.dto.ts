import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateImpresionDto } from './create-impresion.dto';

export class UpdateImpresionDto extends PartialType(
  OmitType(CreateImpresionDto, ['id_pedido'] as const),
) {}
