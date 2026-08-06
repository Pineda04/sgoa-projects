import Dexie, { type Table } from 'dexie';
import type {
	DigitalBlackboardUseStatus,
	TMonitorBuildingAssignments,
} from '@api/monitor';
import type { TCurrentAcademicPeriod } from '@api/periods';

// Feature: caché en Dexie (clave por email) para modo offline del monitor.
export interface MonitorAssignmentsCache {
	/** Email del monitor, normalizado a minúsculas */
	email: string;
	/** Fecha institucional de las asignaciones, en formato YYYY-MM-DD */
	date: string;
	/** Asignaciones del día devueltas por GET /monitor/current-assignments */
	buildings: TMonitorBuildingAssignments[];
	/** Timestamp Unix de la última actualización desde el servidor */
	fetchedAt: number;
}

export interface AcademicPeriodCache {
	/** Email del usuario (clave primaria, normalizado a minúsculas) */
	email: string;
	/** Período vigente devuelto por GET /academic-periods/current */
	period: TCurrentAcademicPeriod;
	/** Timestamp Unix de la última actualización desde el servidor */
	fetchedAt: number;
}

export interface OfflineCheck {
	/** UUID generado en el frontend con crypto.randomUUID() */
	offlineId: string;
	/** Email del monitor dueño del registro (normalizado a minúsculas) */
	email: string;
	courseClassroomId: string;
	/** Fecha en formato ISO string: YYYY-MM-DD */
	checkDate: string;
	/** Hora en formato HH:MM */
	checkTime: string;
	isPresent: boolean;
	observation?: string;
	digitalBlackboardUseStatus?: DigitalBlackboardUseStatus;
	syncStatus:
		| 'PENDING'
		| 'SYNCING'
		| 'SYNCED'
		| 'ERROR'
		| 'CONFLICT'
		| 'REJECTED'
		| 'QUARANTINED';
	syncReason?: string;
	/** Timestamp Unix para mantener el orden FIFO al sincronizar */
	createdAt: number;
}

export interface StoredCredential {
	/** Email del usuario (clave primaria, normalizado a minúsculas) */
	email: string;
	/** Salt aleatorio (base64) usado en PBKDF2 */
	salt: string;
	/** Hash de verificación derivado de la contraseña (base64, 256 bits) */
	passwordHash: string;
	/** IV de AES-GCM (base64, 12 bytes) */
	iv: string;
	/** Access token cifrado con AES-GCM usando clave derivada de la contraseña (base64) */
	encryptedToken: string;
	/** Versión del esquema de derivación; los registros antiguos se descartan en verify */
	version?: number;
	updatedAt: number;
}

class LocalDB extends Dexie {
	offlineChecks!: Table<OfflineCheck>;
	// Feature: tabla de credenciales cifradas para permitir login offline (rol MONITOR)
	credentials!: Table<StoredCredential>;
	// Feature: caché de asignaciones del día por email para modo offline
	monitorAssignments!: Table<MonitorAssignmentsCache>;
	// Feature: caché del período académico vigente por email para modo offline
	academicPeriods!: Table<AcademicPeriodCache>;

	constructor() {
		super('SGOALocalDB');
		this.version(1).stores({
			// Solo se indexan las propiedades por las que se va a buscar/filtrar
			offlineChecks: 'offlineId, courseClassroomId, checkDate, checkTime, syncStatus',
		});
		this.version(2).stores({
			// Feature: v2 agrega la tabla credentials (clave primaria: email)
			offlineChecks: 'offlineId, courseClassroomId, checkDate, checkTime, syncStatus',
			credentials: 'email',
		});
		this.version(3).stores({
			// Feature: v3 agrega las tablas de caché para modo offline del monitor
			// (clave primaria: email del monitor; una fila por usuario)
			offlineChecks: 'offlineId, courseClassroomId, checkDate, checkTime, syncStatus',
			credentials: 'email',
			monitorAssignments: 'email',
			academicPeriods: 'email',
		});
		this.version(4)
			.stores({
				// Feature: v4 aísla offlineChecks por email del monitor (dispositivo
				// compartido). Índices compuestos para lecturas/sync por usuario.
				offlineChecks: 'offlineId, email, [email+checkDate], [email+syncStatus]',
				credentials: 'email',
				monitorAssignments: 'email',
				academicPeriods: 'email',
			})
			.upgrade(async tx => {
				// Las filas previas (v3) no tienen email: huérfanas e inasociables,
				// se descartan para no mezclar registros entre monitores.
				await tx
					.table('offlineChecks')
					.toCollection()
					.filter(check => !check.email)
					.modify({
						syncStatus: 'QUARANTINED',
						syncReason: 'Registro heredado sin owner verificable.',
					});
			});
		this.version(5)
			.stores({
				offlineChecks: 'offlineId, email, [email+checkDate], [email+syncStatus]',
				credentials: 'email',
				monitorAssignments: 'email',
				academicPeriods: 'email',
			})
			.upgrade(async tx => {
				await tx
					.table('offlineChecks')
					.toCollection()
					.filter(check => !check.email)
					.modify({
						syncStatus: 'QUARANTINED',
						syncReason: 'Registro heredado sin owner verificable.',
					});
			});
		this.version(6)
			.stores({
				offlineChecks: 'offlineId, email, [email+checkDate], [email+syncStatus]',
				credentials: 'email',
				monitorAssignments: '[email+date], email',
				academicPeriods: 'email',
			})
			.upgrade(async tx => {
				await tx.table('monitorAssignments').clear();
			});
	}
}

export const db = new LocalDB();
