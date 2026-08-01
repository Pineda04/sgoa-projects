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

const PBKDF2_ITERATIONS = 150_000;
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

const deriveKey = async (password: string, salt: Uint8Array) => {
	const baseKey = await crypto.subtle.importKey(
		'raw',
		encoder.encode(password),
		'PBKDF2',
		false,
		['deriveKey']
	);

	return crypto.subtle.deriveKey(
		{ name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
		baseKey,
		{ name: 'AES-GCM', length: 256 },
		false,
		['encrypt', 'decrypt']
	);
};

const deriveHash = async (password: string, salt: Uint8Array) => {
	const baseKey = await crypto.subtle.importKey(
		'raw',
		encoder.encode(password),
		'PBKDF2',
		false,
		['deriveBits']
	);

	const bits = await crypto.subtle.deriveBits(
		{ name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
		baseKey,
		256
	);

	return new Uint8Array(bits);
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
		const key = await deriveKey(password, salt);
		const hash = await deriveHash(password, salt);

		const encryptedToken = new Uint8Array(
			await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(accessToken))
		);

		await db.credentials.put({
			email: email.toLowerCase(),
			salt: toBase64(salt),
			passwordHash: toBase64(hash),
			iv: toBase64(iv),
			encryptedToken: toBase64(encryptedToken),
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

		const salt = fromBase64(record.salt);
		const expectedHash = fromBase64(record.passwordHash);
		const actualHash = await deriveHash(password, salt);

		if (!timingSafeEqual(actualHash, expectedHash)) return null;

		const key = await deriveKey(password, salt);
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
