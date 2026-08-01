import { SetMetadata } from '@nestjs/common';

export const LOOKUP_SOURCE_KEY = 'lookupSource';

/**
 * Marca un endpoint como fuente de datos de referencia: además del permiso que
 * declara @RequirePermission, lo puede consumir cualquier rol que tenga el
 * permiso implícito `lookup:<subject>` (ver SUBJECT_LOOKUP_DEPENDENCIES).
 *
 * Se aplica solo a listados/consultas de catálogo, nunca a mutaciones.
 */
export const LookupSource = () => SetMetadata(LOOKUP_SOURCE_KEY, true);
