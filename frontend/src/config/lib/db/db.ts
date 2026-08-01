import Dexie, { type Table } from 'dexie';

export interface OfflineCheck {
	/** UUID generado en el frontend con crypto.randomUUID() */
	offlineId: string;
	courseClassroomId: string;
	/** Fecha en formato ISO string: YYYY-MM-DD */
	checkDate: string;
	/** Hora en formato HH:MM */
	checkTime: string;
	isPresent: boolean;
	observation?: string;
	syncStatus: 'PENDING' | 'SYNCING' | 'SYNCED' | 'ERROR';
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
	updatedAt: number;
}

class LocalDB extends Dexie {
	offlineChecks!: Table<OfflineCheck>;
	// Feature: tabla de credenciales cifradas para permitir login offline (rol MONITOR)
	credentials!: Table<StoredCredential>;

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
	}
}

export const db = new LocalDB();
