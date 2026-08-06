import * as XlsxPopulate from 'xlsx-populate';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ExcelResponseDto } from '../dto/excel-response.dto';

const HEADER_FIRST_COLUMN_TOKENS = [
  '#',
  'ID',
  'id',
  'NoEmpleado',
  'numeroEmpleado',
];

@Injectable()
export class ExcelFilesService<Type extends Record<number, string>, Dto> {
  // para que sea reutilizable
  private properties: Type;

  handleFileUpload(file: Express.Multer.File): Express.Multer.File {
    if (!file) throw new BadRequestException('El archivo es requerido.');

    if (!file.originalname.match(/\.(xlsx|xls)$/))
      throw new BadRequestException(
        'El archivo debe ser un Excel, formato permtido: (.xlsx o .xls)',
      );

    // Por si es necesario validar el tamaño del archivo
    // const maxFileSize = 5 * 1024 * 1024; // 5 MB
    // if (file.size > maxFileSize)
    //   throw new BadRequestException('El archivo no debe exceder los 5 MB.');

    return file;
  }

  async generateTemplate(
    headers: string[],
    rowCount: number = 20,
  ): Promise<Buffer> {
    const workbook = await XlsxPopulate.fromBlankAsync();
    const sheet = workbook.sheet(0);

    headers.forEach((header, index) => {
      const cell = sheet.cell(1, index + 1);
      cell.value(header).style({
        bold: true,
        fontColor: 'FFFFFF',
        fill: { type: 'solid', color: '144C74' },
        border: { color: '000000', style: 'thin' },
        verticalAlignment: 'center',
        horizontalAlignment: 'center',
        wrapText: true,
      });
    });

    // Rango vacío para que el coordinador escriba los datos.
    const firstDataRow = 2;
    const lastRow = firstDataRow + rowCount - 1;
    const lastColumn = headers.length;
    const emptyRange = sheet.range(firstDataRow, 1, lastRow, lastColumn);
    emptyRange.style({
      border: { color: 'BFBFBF', style: 'thin' },
    });

    for (let column = 1; column <= lastColumn; column++) {
      sheet.column(column).width(18);
    }

    return Buffer.from(
      (await workbook.outputAsync()) as ArrayBuffer | Uint8Array,
    );
  }

  async processFile(
    properties: Type,
    buffer: Buffer,
  ): Promise<ExcelResponseDto<Dto>> {
    try {
      this.properties = properties;

      const workbook = await XlsxPopulate.fromDataAsync(buffer);
      const sheet = workbook.sheet(0);

      this.validateTemplate(sheet);
      const headers = this.getHeaders(sheet, 1);
      const records = this.getData(sheet, headers, 2);

      return {
        title: '',
        subtitle: '',
        totalRecords: records.length,
        data: records,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException(`Error al procesar el archivo: ${message}`);
    }
  }

  private validateTemplate(sheet: XlsxPopulate.Sheet): void {
    const firstRowFirstCell = sheet.cell(1, 1).value()?.toString().trim() ?? '';

    if (!HEADER_FIRST_COLUMN_TOKENS.includes(firstRowFirstCell)) {
      throw new BadRequestException(
        'El archivo no corresponde a la plantilla de asignación vigente.',
      );
    }
  }

  private getHeaders(sheet: XlsxPopulate.Sheet, headerRow: number): string[] {
    const headers: string[] = [];

    for (let column = 1; column <= 15; column++) {
      const cellValue =
        sheet.cell(headerRow, column).value()?.toString().trim() || '';
      headers.push(cellValue);
    }

    return headers;
  }

  private getData(
    sheet: XlsxPopulate.Sheet,
    headers: string[],
    firstDataRow: number,
  ): Dto[] {
    const records: Dto[] = [];
    let row = firstDataRow;

    while (true) {
      const firstCell = sheet.cell(row, 1).value();
      const secondCell = sheet.cell(row, 2).value();
      if (!firstCell && !secondCell) break; //supondriamos si no tiene id(#), ni NoEmpleado, no hay datos

      const rowData: Partial<Dto> = {};
      let hasData = false;

      for (let column = 1; column <= 15; column++) {
        const rawValue = sheet.cell(row, column).value();
        const value =
          typeof rawValue === 'string'
            ? rawValue.trim()
            : rawValue?.toString() || '';

        if (value) hasData = true;

        const propertyName = this.mapHeaderToProperty(
          headers[column - 1],
          column - 1,
        );
        rowData[propertyName] = this.convertValue(value, column - 1, rawValue);
      }

      if (hasData) records.push(rowData as Dto);
      row++;
    }

    return records;
  }

  private mapHeaderToProperty(header: string, index: number): string {
    // const properties = {
    //   0: 'id',
    //   1: 'numeroEmpleado',
    //   2: 'nombre',
    //   3: 'codigo',
    //   4: 'asignatura',
    //   5: 'seccion',
    //   6: 'uv',
    //   7: 'dias',
    //   8: 'numeroAlumnos',
    //   9: 'numeroAula',
    //   10: 'carrera',
    //   11: 'coordinador',
    //   12: 'centro',
    //   13: 'observaciones',
    // };

    return this.properties[index] || `columna${index}`;
  }

  private convertValue(
    value: string,
    columnIndex: number,
    rawValue?: string | number | boolean | Date | null,
  ): string | number | boolean | null {
    // seccion
    if (columnIndex === 6) {
      return this.parseTimeValue(value, rawValue);
    }

    // Una matrícula vacía es desconocida; cualquier valor no entero se conserva
    // para que la validación de asignación académica pueda rechazarlo.
    if (columnIndex === 7) {
      if (value === '') return null;

      return /^-?\d+$/.test(value) ? Number(value) : value;
    }

    // estudiantes por graduarse
    if (columnIndex === 13) {
      return this.parseNearGraduation(value);
    }

    // id, uv
    const numericColumns = [0, 5];
    const number = parseInt(value);
    return numericColumns.includes(columnIndex) && !isNaN(number)
      ? number
      : value;
  }

  private parseNearGraduation(value: string): boolean {
    const normalized = value.trim().toLowerCase();
    return ['sí', 'si', 's', 'yes', 'y', 'true', '1'].includes(normalized);
  }

  private parseTimeValue(
    value: string,
    rawValue?: string | number | boolean | Date | null,
  ): string {
    if (typeof rawValue === 'number') {
      return this.convertExcelTimeToString(rawValue);
    }

    if (typeof value === 'string') {
      const timePattern = /^(\d{1,2}):(\d{2})(\s*(AM|PM|am|pm))?$/;
      const match = value.match(timePattern);

      if (match) {
        return this.formatTimeString(value);
      }
    }

    return value.toString();
  }

  private convertExcelTimeToString(excelTime: number): string {
    const totalMinutes = Math.round(excelTime * 24 * 60);
    let hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;

    return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }

  private formatTimeString(timeStr: string): string {
    const timePattern = /^(\d{1,2}):(\d{2})(\s*(AM|PM|am|pm))?$/;
    const match = timeStr.match(timePattern);

    if (match) {
      let hours = parseInt(match[1]);
      const minutes = match[2];
      const ampm = match[4]?.toUpperCase();

      if (ampm) {
        if (ampm === 'PM' && hours !== 12) {
          hours += 12;
        } else if (ampm === 'AM' && hours === 12) {
          hours = 0;
        }
      }

      return `${hours.toString().padStart(2, '0')}:${minutes}`;
    }

    return timeStr;
  }
}
