// Nombres de rol usados como convención de negocio (no de autorización).
// Deben mantenerse sincronizados con backend/src/common/constants/role-names.constant.ts.
export const ROLE_NAMES = {
	SUPER_ADMIN: 'SUPER_ADMIN',
	DOCENTE: 'DOCENTE',
	COORDINADOR_AREA: 'COORDINADOR_AREA',
} as const;
