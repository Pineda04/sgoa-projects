export class ExcelResponseDto<T> {
  title: string;
  subtitle: string;
  totalRecords: number;
  data: T[];
}
