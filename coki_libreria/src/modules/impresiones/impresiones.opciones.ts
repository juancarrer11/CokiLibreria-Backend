import {
  impresiones_tipo_impresion,
  impresiones_tipo_papel,
} from '../../generated/prisma/enums';

export const TIPOS_IMPRESION = {
  'Blanco y negro': impresiones_tipo_impresion.Blanco_y_negro,
  Color: impresiones_tipo_impresion.Color,
} as const;

export const TIPOS_PAPEL = {
  'Papel común': impresiones_tipo_papel.Papel_comun,
  'Papel fotográfico': impresiones_tipo_papel.Papel_fotografico,
  'Papel adhesivo': impresiones_tipo_papel.Papel_adhesivo,
} as const;

export type NombreTipoImpresion = keyof typeof TIPOS_IMPRESION;
export type NombreTipoPapel = keyof typeof TIPOS_PAPEL;

export const PRECIO_POR_COPIA: Record<impresiones_tipo_impresion, number> = {
  Blanco_y_negro: 200,
  Color: 400,
};

export function nombreTipoImpresion(valor: impresiones_tipo_impresion) {
  return buscarNombre(TIPOS_IMPRESION, valor);
}

export function nombreTipoPapel(valor: impresiones_tipo_papel) {
  return buscarNombre(TIPOS_PAPEL, valor);
}

function buscarNombre(opciones: Record<string, string>, valor: string) {
  return Object.keys(opciones).find((nombre) => opciones[nombre] === valor);
}
