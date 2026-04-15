import { BadRequestException } from '@nestjs/common';

export const dateToHHMM = (date: Date): string => {
  const d = new Date(date);

  return (
    d.getUTCHours().toString().padStart(2, '0') +
    ':' +
    d.getUTCMinutes().toString().padStart(2, '0')
  );
};

export const hourToDateUTC = (hour: string): Date => {
  if (!hour.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/gm))
    throw new BadRequestException('Hora no válida.');

  const [hh, mm] = hour.split(':').map((n) => parseInt(n, 10));

  return new Date(Date.UTC(1970, 0, 1, hh, mm, 0));
};
