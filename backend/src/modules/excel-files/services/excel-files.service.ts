import * as XlsxPopulate from 'xlsx-populate';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ExcelResponseDto } from '../dto/excel-response.dto';

@Injectable()
export class ExcelFilesService<Type, Dto> {
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

  async processFile(
    properties: Type,
    buffer: Buffer,
  ): Promise<ExcelResponseDto<Dto>> {
    try {
      this.properties = properties;

      const workbook = await XlsxPopulate.fromDataAsync(buffer);
      const sheet = workbook.sheet(0);

      const title: string = sheet.cell('A1').value()?.toString() || '';
      const subtitle: string = sheet.cell('A2').value()?.toString() || '';

      const headers = this.getHeaders(sheet);
      const records = this.getData(sheet, headers);

      return {
        title,
        subtitle,
        totalRecords: records.length,
        data: records,
      };
    } catch (error) {
      throw new BadRequestException(
        `Error al procesar el archivo: ${error.message}`,
      );
    }
  }

  private getHeaders(sheet: XlsxPopulate.Sheet): string[] {
    const headers: string[] = [];

    for (let column = 1; column <= 14; column++) {
      const cellValue = sheet.cell(4, column).value()?.toString().trim() || '';
      headers.push(cellValue);
    }

    return headers;
  }

  private getData(sheet: XlsxPopulate.Sheet, headers: string[]): Dto[] {
    const records: Dto[] = [];
    let row = 5;

    while (true) {
      const firstCell = sheet.cell(row, 1).value();
      const secondCell = sheet.cell(row, 2).value();
      if (!firstCell && !secondCell) break; //supondriamos si no tiene id(#), ni NoEmpleado, no hay datos

      const rowData: Partial<Dto> = {};
      let hasData = false;

      for (let column = 1; column <= 14; column++) {
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
    rawValue?: string | number | boolean | Date | null | undefined,
  ): string | number {
    //seccion
    if (columnIndex === 5) {
      return this.parseTimeValue(value, rawValue);
    }

    // id, uv, días, numero de alumnos, numero de aula
    const numericColumns = [0, 6, 7, 8, 9];
    const number = parseInt(value);
    return numericColumns.includes(columnIndex) && !isNaN(number)
      ? number
      : value;
  }

  private parseTimeValue(
    value: string,
    rawValue?: string | number | boolean | Date | null | undefined,
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
