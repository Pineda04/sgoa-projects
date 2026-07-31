import {
	TMonitorAssignmentCheckStatus,
	TMonitorBuildingAssignments,
	TMonitorCurrentAssignment,
} from '@api/monitor';

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

const formatMinutes = (totalMinutes: number): string => {
	const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
	const minutes = String(totalMinutes % 60).padStart(2, '0');
	return `${hours}:${minutes}`;
};

export const parseStartMinutes = (section: string): number | null => {
	const match = section.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
	if (!match) return null;

	let hours = Number(match[1]);
	const meridiem = match[3]?.toUpperCase();

	if (meridiem === 'PM' && hours !== 12) hours += 12;
	if (meridiem === 'AM' && hours === 12) hours = 0;

	return hours * 60 + Number(match[2]);
};

export const parseStartTime = (section: string): string | null => {
	const startMinutes = parseStartMinutes(section);
	return startMinutes === null ? null : formatMinutes(startMinutes);
};

export type TJornada = 'MORNING' | 'AFTERNOON';
export type TJornadaFilter = TJornada | 'ALL';

const AFTERNOON_START_MINUTES = 13 * 60;

export const JORNADA_OPTIONS: {
	value: TJornadaFilter;
	label: string;
	hint?: string;
}[] = [
	{ value: 'MORNING', label: 'Mañana', hint: '07:00 – 13:00' },
	{ value: 'AFTERNOON', label: 'Tarde', hint: '13:00 – 21:00' },
	{ value: 'ALL', label: 'Todo el día' },
];

export const getJornadaFromMinutes = (
	startMinutes: number | null
): TJornada | null => {
	if (startMinutes === null) return null;
	return startMinutes < AFTERNOON_START_MINUTES ? 'MORNING' : 'AFTERNOON';
};

export const getCurrentJornada = (): TJornada =>
	new Date().getHours() < 13 ? 'MORNING' : 'AFTERNOON';

export type TAssignmentStatus = 'PENDING' | 'COMPLIANT' | 'NON_COMPLIANT';

export const getAssignmentStatus = (
	check: TMonitorAssignmentCheckStatus | null
): TAssignmentStatus => {
	if (!check) return 'PENDING';
	return check.isPresent ? 'COMPLIANT' : 'NON_COMPLIANT';
};

export const ASSIGNMENT_STATUS_CONFIG: Record<
	TAssignmentStatus,
	{ label: string; badgeClassName: string; dotClassName: string }
> = {
	PENDING: {
		label: 'Pendiente',
		badgeClassName:
			'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300',
		dotClassName: 'bg-amber-500',
	},
	COMPLIANT: {
		label: 'Cumple',
		badgeClassName:
			'bg-green-100 text-green-700 dark:bg-green-400/15 dark:text-green-300',
		dotClassName: 'bg-green-500',
	},
	NON_COMPLIANT: {
		label: 'No cumple',
		badgeClassName:
			'bg-red-100 text-red-700 dark:bg-red-400/15 dark:text-red-300',
		dotClassName: 'bg-red-500',
	},
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

export type TChecklistView = 'COMPACT' | 'DETAILED' | 'GRID';
export type TStatusFilter = 'ALL' | 'PENDING' | 'VERIFIED';

export const CHECKLIST_VIEW_STORAGE_KEY = 'monitor-checklist-view';

export const isChecklistView = (value: unknown): value is TChecklistView =>
	value === 'COMPACT' || value === 'DETAILED' || value === 'GRID';

export interface TChecklistItem {
	id: string;
	assignment: TMonitorCurrentAssignment;
	check: TMonitorAssignmentCheckStatus | null;
	status: TAssignmentStatus;
	buildingId: string;
	buildingName: string;
	classroomId: string;
	classroomName: string;
	startMinutes: number | null;
	startTime: string | null;
	jornada: TJornada | null;
	schedule: string;
	searchText: string;
}

export interface TChecklistBuildingGroup {
	buildingId: string;
	buildingName: string;
	items: TChecklistItem[];
}

export interface TAssignmentViewProps {
	item: TChecklistItem;
	isSubmitting: boolean;
	disabled: boolean;
	onConfirm: (isPresent: boolean) => void;
	onOpenModal: () => void;
}

export interface TChecklistScope {
	jornada: TJornadaFilter;
	buildingId: string;
	search: string;
}

const compareItems = (a: TChecklistItem, b: TChecklistItem): number => {
	if (a.startMinutes !== b.startMinutes) {
		if (a.startMinutes === null) return 1;
		if (b.startMinutes === null) return -1;
		return a.startMinutes - b.startMinutes;
	}

	return (
		a.buildingName.localeCompare(b.buildingName) ||
		a.classroomName.localeCompare(b.classroomName) ||
		a.assignment.courseName.localeCompare(b.assignment.courseName)
	);
};

export const buildChecklistItems = (
	buildings: TMonitorBuildingAssignments[],
	checkOverrides: Record<string, TMonitorAssignmentCheckStatus>
): TChecklistItem[] => {
	const items = buildings.flatMap(building =>
		building.classrooms.flatMap(classroom =>
			classroom.assignments.map<TChecklistItem>(assignment => {
				const check =
					checkOverrides[assignment.courseClassroomId] ?? assignment.check;
				const startMinutes = parseStartMinutes(assignment.section);
				const startTime =
					startMinutes === null ? null : formatMinutes(startMinutes);

				return {
					id: assignment.courseClassroomId,
					assignment,
					check,
					status: getAssignmentStatus(check),
					buildingId: building.buildingId,
					buildingName: building.buildingName,
					classroomId: classroom.classroomId,
					classroomName: classroom.classroomName,
					startMinutes,
					startTime,
					jornada: getJornadaFromMinutes(startMinutes),
					schedule: `${formatDays(assignment.days)}${startTime ? ` · ${startTime}` : ''}`,
					searchText: [
						assignment.courseName,
						assignment.courseCode,
						assignment.groupCode,
						assignment.teacher.name,
						classroom.classroomName,
						building.buildingName,
					]
						.join(' ')
						.toLowerCase(),
				};
			})
		)
	);

	return items.sort(compareItems);
};

export const filterByScope = (
	items: TChecklistItem[],
	{ jornada, buildingId, search }: TChecklistScope
): TChecklistItem[] => {
	const term = search.trim().toLowerCase();

	return items.filter(item => {
		const matchesBuilding = !buildingId || item.buildingId === buildingId;
		const matchesJornada =
			jornada === 'ALL' || item.jornada === null || item.jornada === jornada;
		const matchesSearch = !term || item.searchText.includes(term);

		return matchesBuilding && matchesJornada && matchesSearch;
	});
};

export const filterByStatus = (
	items: TChecklistItem[],
	status: TStatusFilter
): TChecklistItem[] => {
	if (status === 'ALL') return items;

	return items.filter(item =>
		status === 'PENDING'
			? item.status === 'PENDING'
			: item.status !== 'PENDING'
	);
};

export const groupItemsByBuilding = (
	items: TChecklistItem[]
): TChecklistBuildingGroup[] => {
	const groups = new Map<string, TChecklistBuildingGroup>();

	for (const item of items) {
		let group = groups.get(item.buildingId);

		if (!group) {
			group = {
				buildingId: item.buildingId,
				buildingName: item.buildingName,
				items: [],
			};
			groups.set(item.buildingId, group);
		}

		group.items.push(item);
	}

	return Array.from(groups.values()).sort((a, b) =>
		a.buildingName.localeCompare(b.buildingName)
	);
};

export interface TChecklistSummary {
	total: number;
	pending: number;
	verified: number;
}

export const summarizeItems = (items: TChecklistItem[]): TChecklistSummary => {
	const pending = items.filter(item => item.status === 'PENDING').length;

	return { total: items.length, pending, verified: items.length - pending };
};

export const countPendingByJornada = (
	items: TChecklistItem[],
	jornada: TJornadaFilter
): number =>
	items.filter(
		item =>
			item.status === 'PENDING' &&
			(jornada === 'ALL' || item.jornada === null || item.jornada === jornada)
	).length;
