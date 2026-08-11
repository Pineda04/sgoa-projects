import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

export const INSTITUTIONAL_TIME_ZONE = 'America/Tegucigalpa';

export const monitoringDayStart = (date: string): Date =>
  fromZonedTime(`${date}T00:00:00`, INSTITUTIONAL_TIME_ZONE);

export const monitoringDayEnd = (date: string): Date =>
  fromZonedTime(`${date}T23:59:59.999`, INSTITUTIONAL_TIME_ZONE);

export const currentMonitoringDate = (): string =>
  formatInTimeZone(new Date(), INSTITUTIONAL_TIME_ZONE, 'yyyy-MM-dd');

export const currentMonitoringDayIndex = (): number =>
  Number(formatInTimeZone(new Date(), INSTITUTIONAL_TIME_ZONE, 'i')) % 7;
