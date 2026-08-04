export const COURSE_CLASSROOM_DAY_CODES = [
  'Lu',
  'Ma',
  'Mi',
  'Ju',
  'Vi',
  'Sa',
  'Do',
] as const;

export type CourseClassroomDayCode =
  (typeof COURSE_CLASSROOM_DAY_CODES)[number];

export type CourseClassroomSection = {
  startTime: string;
  endTime: string;
  startMinutes: number;
  endMinutes: number;
};

function parseTime(value: string): { time: string; minutes: number } | null {
  const normalized = value.trim();
  const time24 = normalized.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);

  if (time24) {
    const hours = Number(time24[1]);
    const minutes = Number(time24[2]);
    return {
      time: `${hours.toString().padStart(2, '0')}:${time24[2]}`,
      minutes: hours * 60 + minutes,
    };
  }

  const time12 = normalized.match(/^(0?[1-9]|1[0-2]):([0-5]\d)\s*([AP]M)$/i);
  if (!time12) return null;

  const period = time12[3].toUpperCase();
  const hours = (Number(time12[1]) % 12) + (period === 'PM' ? 12 : 0);
  const minutes = Number(time12[2]);

  return {
    time: `${hours.toString().padStart(2, '0')}:${time12[2]}`,
    minutes: hours * 60 + minutes,
  };
}

export function normalizeCourseClassroomDays(value: string): string {
  if (typeof value !== 'string') {
    throw new Error('Los días deben ser una cadena de texto.');
  }

  const input = value.trim();
  const days = input.match(/Lu|Ma|Mi|Ju|Vi|Sa|Do/g) ?? [];

  if (days.join('') !== input || days.length === 0) {
    throw new Error(
      'Los días deben ser una combinación válida de Lu, Ma, Mi, Ju, Vi, Sa o Do.',
    );
  }

  if (new Set(days).size !== days.length) {
    throw new Error('Los días no pueden contener códigos duplicados.');
  }

  const selectedDays = new Set(days);
  return COURSE_CLASSROOM_DAY_CODES.filter((day) => selectedDays.has(day)).join(
    '',
  );
}

export function parseCourseClassroomDays(
  value: string,
): CourseClassroomDayCode[] | null {
  try {
    const days = normalizeCourseClassroomDays(value).match(/.{2}/g);
    return days?.map((day) => day as CourseClassroomDayCode) ?? null;
  } catch {
    return null;
  }
}

export function parseCourseClassroomSection(
  value: string,
): CourseClassroomSection | null {
  if (typeof value !== 'string') return null;

  const range = value.trim().match(/^(.+?)\s*-\s*(.+?)$/);
  if (!range) return null;

  const start = parseTime(range[1]);
  const end = parseTime(range[2]);

  if (!start || !end || start.minutes >= end.minutes) return null;

  return {
    startTime: start.time,
    endTime: end.time,
    startMinutes: start.minutes,
    endMinutes: end.minutes,
  };
}

export function normalizeCourseClassroomSection(value: string): string {
  const section = parseCourseClassroomSection(value);

  if (!section) {
    throw new Error(
      'El horario debe incluir un inicio y fin válidos, con inicio menor que fin.',
    );
  }

  return `${section.startTime} - ${section.endTime}`;
}

export function courseClassroomSectionsOverlap(
  first: string,
  second: string,
): boolean {
  const firstSection = parseCourseClassroomSection(first);
  const secondSection = parseCourseClassroomSection(second);

  return Boolean(
    firstSection &&
      secondSection &&
      firstSection.startMinutes < secondSection.endMinutes &&
      secondSection.startMinutes < firstSection.endMinutes,
  );
}

export function courseClassroomSchedulesConflict(
  firstDays: string,
  firstSection: string,
  secondDays: string,
  secondSection: string,
): boolean {
  const firstParsedDays = parseCourseClassroomDays(firstDays);
  const secondParsedDays = parseCourseClassroomDays(secondDays);

  // Unknown legacy data cannot safely prove that the schedules are disjoint.
  if (!firstParsedDays || !secondParsedDays) return true;

  const secondDaysSet = new Set(secondParsedDays);
  if (!firstParsedDays.some((day) => secondDaysSet.has(day))) return false;

  if (
    !parseCourseClassroomSection(firstSection) ||
    !parseCourseClassroomSection(secondSection)
  ) {
    return true;
  }

  return courseClassroomSectionsOverlap(firstSection, secondSection);
}
