export function toHondurasTimeInput(utcDate: string): string {
  const date = new Date(utcDate);
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "America/Tegucigalpa",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  return new Intl.DateTimeFormat("en-GB", options).format(date);
}
