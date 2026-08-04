import type { TCreateCheck } from '@api/monitor';

const DATABASE_NAME = 'sgoa-monitoring';
const DATABASE_VERSION = 1;
const STORE_NAME = 'pending-checks';

export type TQueuedMonitorCheck = TCreateCheck & {
	offlineId: string;
	ownerUserId: string;
	queuedAt: string;
};

const openDatabase = (): Promise<IDBDatabase> =>
	new Promise((resolve, reject) => {
		const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
		request.onupgradeneeded = () => {
			const database = request.result;
			if (!database.objectStoreNames.contains(STORE_NAME)) {
				database.createObjectStore(STORE_NAME, { keyPath: 'offlineId' });
			}
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});

export const saveQueuedCheck = async (
	check: TQueuedMonitorCheck
): Promise<void> => {
	const database = await openDatabase();
	await new Promise<void>((resolve, reject) => {
		const transaction = database.transaction(STORE_NAME, 'readwrite');
		transaction.objectStore(STORE_NAME).put(check);
		transaction.oncomplete = () => resolve();
		transaction.onerror = () => reject(transaction.error);
	});
	database.close();
};

export const getQueuedChecks = async (
	ownerUserId: string
): Promise<TQueuedMonitorCheck[]> => {
	const database = await openDatabase();
	const checks = await new Promise<TQueuedMonitorCheck[]>((resolve, reject) => {
		const request: IDBRequest<TQueuedMonitorCheck[]> = database
			.transaction(STORE_NAME, 'readonly')
			.objectStore(STORE_NAME)
			.getAll();
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
	database.close();
	return checks
		.filter(check => check.ownerUserId === ownerUserId)
		.sort((left, right) => left.queuedAt.localeCompare(right.queuedAt));
};

export const removeQueuedCheck = async (offlineId: string): Promise<void> => {
	const database = await openDatabase();
	await new Promise<void>((resolve, reject) => {
		const transaction = database.transaction(STORE_NAME, 'readwrite');
		transaction.objectStore(STORE_NAME).delete(offlineId);
		transaction.oncomplete = () => resolve();
		transaction.onerror = () => reject(transaction.error);
	});
	database.close();
};
