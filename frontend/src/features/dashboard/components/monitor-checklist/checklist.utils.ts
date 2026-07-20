import { TMonitorAssignmentCheckStatus } from '@api/monitor';

const DAY_LABELS: Record<string, string> = {
	Do: 'Domingo',
	Lu: 'Lunes',
	Ma: 'Martes',
	Mi: 'Miércoles',
	Ju: 'Jueves',
	Vi: 'Viernes',
	Sa: 'Sábado',
};

export const formatDays = (days: string): string => {
	const chunks = days.match(/.{1,2}/g) ?? [];
	return chunks.map(chunk => DAY_LABELS[chunk] ?? chunk).join(', ');
};

export const parseStartTime = (section: string): string | null => {
	const match = section.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
	if (!match) return null;

	let hours = Number(match[1]);
	const meridiem = match[3]?.toUpperCase();

	if (meridiem === 'PM' && hours !== 12) hours += 12;
	if (meridiem === 'AM' && hours === 12) hours = 0;

	return `${String(hours).padStart(2, '0')}:${match[2]}`;
};

export type TJornada = 'MORNING' | 'AFTERNOON';

export const JORNADA_LABELS: Record<TJornada, string> = {
	MORNING: 'Mañana (07:00-13:00)',
	AFTERNOON: 'Tarde (13:00-21:00)',
};

export const getJornadaFromSection = (section: string): TJornada | null => {
	const startTime = parseStartTime(section);
	if (!startTime) return null;

	const hour = Number(startTime.split(':')[0]);
	return hour < 13 ? 'MORNING' : 'AFTERNOON';
};

export const getCurrentJornada = (): TJornada => {
	return new Date().getHours() < 13 ? 'MORNING' : 'AFTERNOON';
};

export type TAssignmentStatus = 'PENDING' | 'COMPLIANT' | 'NON_COMPLIANT';

export const getAssignmentStatus = (
	check: TMonitorAssignmentCheckStatus | null
): TAssignmentStatus => {
	if (!check) return 'PENDING';
	return check.isPresent ? 'COMPLIANT' : 'NON_COMPLIANT';
};

export const getTodayDateString = (): string => {
	const now = new Date();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	return `${now.getFullYear()}-${month}-${day}`;
};

export const getCurrentTimeString = (): string => {
	const now = new Date();
	const hours = String(now.getHours()).padStart(2, '0');
	const minutes = String(now.getMinutes()).padStart(2, '0');
	return `${hours}:${minutes}`;
};

export const ASSIGNMENT_STATUS_CONFIG: Record<
	TAssignmentStatus,
	{ label: string; badgeClassName: string }
> = {
	PENDING: {
		label: 'Pendiente',
		badgeClassName: 'bg-amber-100 text-amber-800',
	},
	COMPLIANT: {
		label: 'Cumple',
		badgeClassName: 'bg-green-100 text-green-700',
	},
	NON_COMPLIANT: {
		label: 'No cumple',
		badgeClassName: 'bg-red-100 text-red-700',
	},
};
