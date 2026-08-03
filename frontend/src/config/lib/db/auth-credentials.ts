import { db } from './db';

// Feature: credenciales locales cifradas para login offline (rol MONITOR).
// La contraseña nunca se guarda en texto plano: se deriva una clave PBKDF2 (SHA-256)
// y el access token se cifra con AES-GCM. Sin la contraseña no se puede verificar
// ni descifrar el token guardado.

interface CredentialsInput {
	email: string;
	password: string;
}

interface SaveCredentialsInput extends CredentialsInput {
	accessToken: string;
}

const PBKDF2_ITERATIONS = 600_000;
// Versión del esquema de derivación: se incrementa al cambiar salt/iteraciones/info.
// Los registros con version distinta no son legibles y se descartan en verifyCredentials.
const CREDENTIALS_VERSION = 2;
// Salt público fijo para HKDF; la separación de dominios la dan los `info`.
const HKDF_SALT = new TextEncoder().encode('sgoa-offline-credentials');
const VERIFY_INFO = new TextEncoder().encode('offline.verify');
const AES_INFO = new TextEncoder().encode('offline.aes');
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const toBase64 = (bytes: Uint8Array) => {
	let binary = '';
	bytes.forEach(byte => (binary += String.fromCharCode(byte)));
	return btoa(binary);
};

const fromBase64 = (value: string) => {
	const binary = atob(value);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return bytes;
};

// Material maestro: PBKDF2(password, salt). Con este mismo material se derivan,
// vía HKDF con `info` distintos, la clave AES-GCM y el hash de verificación, de
// modo que el hash almacenado no pueda descifrar el token (separación de dominio).
const deriveMasterBits = async (password: string, salt: Uint8Array) => {
	const baseKey = await crypto.subtle.importKey(
		'raw',
		encoder.encode(password),
		'PBKDF2',
		false,
		['deriveBits']
	);

	return crypto.subtle.deriveBits(
		{ name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
		baseKey,
		256
	);
};

const deriveVerifyHash = async (masterBits: ArrayBuffer) => {
	const hkdfKey = await crypto.subtle.importKey(
		'raw',
		masterBits,
		'HKDF',
		false,
		['deriveBits']
	);

	const bits = await crypto.subtle.deriveBits(
		{ name: 'HKDF', hash: 'SHA-256', salt: HKDF_SALT, info: VERIFY_INFO },
		hkdfKey,
		256
	);

	return new Uint8Array(bits);
};

const deriveCryptoKey = async (masterBits: ArrayBuffer) => {
	const hkdfKey = await crypto.subtle.importKey(
		'raw',
		masterBits,
		'HKDF',
		false,
		['deriveKey']
	);

	return crypto.subtle.deriveKey(
		{ name: 'HKDF', hash: 'SHA-256', salt: HKDF_SALT, info: AES_INFO },
		hkdfKey,
		{ name: 'AES-GCM', length: 256 },
		false,
		['encrypt', 'decrypt']
	);
};

const timingSafeEqual = (a: Uint8Array, b: Uint8Array) => {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
	return diff === 0;
};

// crypto.subtle solo existe en contextos seguros (localhost/https). En http por IP-LAN
// se degrada sin romper: no se guarda ni se verifica localmente.
const hasCrypto = () => typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined';

export const saveCredentials = async ({
	email,
	password,
	accessToken,
}: SaveCredentialsInput): Promise<boolean> => {
	try {
		if (!hasCrypto()) return false;

		const salt = crypto.getRandomValues(new Uint8Array(16));
		const iv = crypto.getRandomValues(new Uint8Array(12));
		const masterBits = await deriveMasterBits(password, salt);
		const hash = await deriveVerifyHash(masterBits);
		const key = await deriveCryptoKey(masterBits);

		const encryptedToken = new Uint8Array(
			await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(accessToken))
		);

		await db.credentials.put({
			email: email.toLowerCase(),
			salt: toBase64(salt),
			passwordHash: toBase64(hash),
			iv: toBase64(iv),
			encryptedToken: toBase64(encryptedToken),
			version: CREDENTIALS_VERSION,
			updatedAt: Date.now(),
		});

		return true;
	} catch (error) {
		console.warn('No se pudieron guardar las credenciales locales:', error);
		return false;
	}
};

export const verifyCredentials = async ({
	email,
	password,
}: CredentialsInput): Promise<string | null> => {
	try {
		if (!hasCrypto()) return null;

		const record = await db.credentials.get(email.toLowerCase());
		if (!record) return null;

		// Registros del esquema anterior no son legibles con la derivación actual:
		// se descartan y se re-guardan en el próximo login online.
		if (record.version !== CREDENTIALS_VERSION) {
			await db.credentials.delete(record.email);
			return null;
		}

		const salt = fromBase64(record.salt);
		const masterBits = await deriveMasterBits(password, salt);
		const actualHash = await deriveVerifyHash(masterBits);
		const expectedHash = fromBase64(record.passwordHash);

		if (!timingSafeEqual(actualHash, expectedHash)) return null;

		const key = await deriveCryptoKey(masterBits);
		const decrypted = await crypto.subtle.decrypt(
			{ name: 'AES-GCM', iv: fromBase64(record.iv) },
			key,
			fromBase64(record.encryptedToken)
		);

		return decoder.decode(decrypted);
	} catch (error) {
		console.warn('No se pudieron verificar las credenciales locales:', error);
		return null;
	}
};
