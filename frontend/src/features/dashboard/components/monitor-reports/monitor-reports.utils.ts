import { EReportGroupBy, TMonitorReportGroup } from '@api/monitor';

const toDateString = (date: Date): string => {
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${date.getFullYear()}-${month}-${day}`;
};

export const getTodayDateString = (): string => toDateString(new Date());

export const getDateDaysAgoString = (daysAgo: number): string => {
	const date = new Date();
	date.setDate(date.getDate() - daysAgo);
	return toDateString(date);
};

const dateFormatter = new Intl.DateTimeFormat('es-HN', {
	timeZone: 'UTC',
	day: '2-digit',
	month: '2-digit',
	year: 'numeric',
});

export const formatCheckDate = (isoDate: string): string => {
	if (!isoDate) return '-';
	return dateFormatter.format(new Date(isoDate));
};

export const STATUS_BADGE_CONFIG = {
	PRESENT: {
		label: 'Presente',
		badgeClassName: 'bg-green-100 text-green-700',
	},
	ABSENT: {
		label: 'Ausente',
		badgeClassName: 'bg-red-100 text-red-700',
	},
} as const;

export const GROUP_BY_OPTIONS: { value: EReportGroupBy; label: string }[] = [
	{ value: EReportGroupBy.DAY, label: 'Día' },
	{ value: EReportGroupBy.TEACHER, label: 'Docente' },
	{ value: EReportGroupBy.BUILDING, label: 'Edificio' },
];

export const getGroupByChartTitle = (groupBy: EReportGroupBy): string => {
	switch (groupBy) {
		case EReportGroupBy.TEACHER:
			return 'Cumplimiento por docente';
		case EReportGroupBy.BUILDING:
			return 'Cumplimiento por edificio';
		case EReportGroupBy.DAY:
		default:
			return 'Cumplimiento por día';
	}
};

const ISO_DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const isDateGroupKey = (groupKey: string): boolean =>
	ISO_DATE_KEY_PATTERN.test(groupKey);

export const formatGroupLabel = (group: TMonitorReportGroup): string =>
	isDateGroupKey(group.groupKey)
		? formatCheckDate(group.groupKey)
		: group.groupLabel;
