const toCanonicalTime = (value: string): string | null => {
	const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(value.trim());
	if (!match) return null;

	let hours = Number(match[1]);
	const minutes = Number(match[2]);
	const meridiem = match[3]?.toUpperCase();

	if (minutes > 59 || hours > (meridiem ? 12 : 23) || hours < 0) return null;
	if (meridiem === 'PM' && hours !== 12) hours += 12;
	if (meridiem === 'AM' && hours === 12) hours = 0;

	return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export const parseScheduleRange = (
	section: string
): { startTime: string; endTime: string } => {
	const separatorIndex = section.indexOf(' - ');
	if (separatorIndex === -1) {
		return {
			startTime: toCanonicalTime(section) ?? '',
			endTime: '',
		};
	}

	const startValue = section.slice(0, separatorIndex);
	const endValue = section.slice(separatorIndex + 3);

	return {
		startTime: toCanonicalTime(startValue) ?? '',
		endTime: toCanonicalTime(endValue) ?? '',
	};
};

export const createScheduleRange = (startTime: string, endTime: string) =>
	`${startTime} - ${endTime}`;

export const isValidScheduleRange = (section: string): boolean => {
	const { startTime, endTime } = parseScheduleRange(section);
	return Boolean(
		startTime &&
		endTime &&
		startTime < endTime &&
		section === createScheduleRange(startTime, endTime)
	);
};

export const formatScheduleRange = (section: string): string | null => {
	const { startTime, endTime } = parseScheduleRange(section);
	if (!startTime) return null;
	return endTime ? createScheduleRange(startTime, endTime) : startTime;
};
