import { db } from './db';
import type { TMonitorBuildingAssignments } from '@api/monitor';
import type { TCurrentAcademicPeriod } from '@api/periods';

// Feature: caché local (Dexie) para modo offline del monitor. La clave es el email
// del usuario: cada fetch exitoso sobreescribe la fila correspondiente y, sin red,
// la app lee de aquí en vez de llamar a los endpoints del backend.
// Se importan solo tipos desde @api para no crear dependencias circulares con @config/lib.

const normalizeEmail = (email: string) => email.toLowerCase();

// Retención de los checks ya sincronizados: se conservan unos días por si se necesita
// auditar localmente y luego se descartan para que la tabla no crezca sin límite.
// El histórico definitivo vive en el backend.
const SYNCED_RETENTION_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

export const saveCurrentAssignments = async (
	email: string,
	buildings: TMonitorBuildingAssignments[]
) => {
	try {
		await db.monitorAssignments.put({
			email: normalizeEmail(email),
			buildings,
			fetchedAt: Date.now(),
		});
	} catch (error) {
		console.warn('No se pudo guardar la caché de asignaciones:', error);
	}
};

export const getCachedAssignments = async (email: string) => {
	const record = await db.monitorAssignments.get(normalizeEmail(email));
	return record?.buildings ?? [];
};

export const saveCurrentAcademicPeriod = async (
	email: string,
	period: TCurrentAcademicPeriod
) => {
	try {
		await db.academicPeriods.put({
			email: normalizeEmail(email),
			period,
			fetchedAt: Date.now(),
		});
	} catch (error) {
		console.warn('No se pudo guardar la caché del período académico:', error);
	}
};

export const getCachedAcademicPeriod = async (email: string) => {
	const record = await db.academicPeriods.get(normalizeEmail(email));
	return record?.period ?? null;
};

// Limpia solo las caches renovables de otros usuarios. Los checks se conservan
// por propietario hasta sincronizarse o descartarse expresamente.
export const clearOtherMonitorsCache = async (email: string) => {
	const normalized = normalizeEmail(email);
	try {
		await db.transaction(
			'rw',
			db.monitorAssignments,
			db.academicPeriods,
			async () => {
				await db.monitorAssignments.where('email').notEqual(normalized).delete();
				await db.academicPeriods.where('email').notEqual(normalized).delete();
			}
		);
	} catch (error) {
		console.warn('No se pudo limpiar la caché de otros monitores:', error);
	}
};

// Política de retención de offlineChecks: borra los registros SYNCED con más de 7 días
// de antigüedad (createdAt). Los pendientes no se tocan; se reintenta o se corrigen.
export const cleanupSyncedChecks = async (email?: string) => {
	const cutoff = Date.now() - SYNCED_RETENTION_MS;
	try {
		await db.offlineChecks
			.where('[email+syncStatus]')
			.equals([normalizeEmail(email ?? ''), 'SYNCED'])
			.filter(check => check.createdAt < cutoff)
			.delete();
	} catch (error) {
		console.warn('No se pudo limpiar los checks sincronizados antiguos:', error);
	}
};
