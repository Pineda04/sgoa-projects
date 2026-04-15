import { formatInTimeZone } from 'date-fns-tz';

export const formatDateTimeZone = (
  date: Date,
  timeZone: string = 'America/Tegucigalpa',
): string => formatInTimeZone(date, timeZone, 'yyyy-MM-dd HH:mm:ss');
