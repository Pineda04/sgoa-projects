import { TPlanification } from '@api/assignment-reports';
import { downloadBlob } from '@shared/utils';

const HEADER_FILL = 'FF144C74';
const HEADER_FONT_COLOR = 'FFFFFFFF';
const BORDER_BLACK = 'FF000000';
const BORDER_LIGHT = 'FFBFBFBF';

const thinBorder = (color: string) => ({
	top: { style: 'thin' as const, color: { argb: color } },
	left: { style: 'thin' as const, color: { argb: color } },
	bottom: { style: 'thin' as const, color: { argb: color } },
	right: { style: 'thin' as const, color: { argb: color } },
});

const RISKY_LEADING_CHARS = ['=', '+', '-', '@'];

const sanitizeExcelCell = (value: string | number): string | number => {
	if (typeof value !== 'string') return value;

	return RISKY_LEADING_CHARS.some(char => value.startsWith(char))
		? `'${value}`
		: value;
};

export async function exportPlanificationExcel(
	data: TPlanification[],
	pac: number,
	year: number,
	responsible: string,
	departmentName: string
) {
	const ExcelJS = await import('exceljs');
	const workbook = new ExcelJS.Workbook();
	const sheet = workbook.addWorksheet('Planificación Académica');

	const totalColumns = 15;
	const headers = [
		'#',
		'No. Empleado',
		'Nombre',
		'Codigo',
		'Asignatura',
		'Sección',
		'UV',
		'Días',
		'No. Alumnos',
		'No. Aula',
		'Carrera',
		'Jefe/Coordinador',
		'Centro/Telecentro',
		'Est. Por Egresar',
		'Observación',
	];
	const columnWidths = Array(totalColumns).fill(18);

	sheet.columns = columnWidths.map(width => ({ width }));

	sheet.mergeCells(1, 1, 1, totalColumns);
	sheet.getCell(1, 1).value = 'UNAH Campus Copán';
	sheet.getCell(1, 1).font = { bold: true, size: 16 };
	sheet.getCell(1, 1).alignment = { horizontal: 'center' };
	sheet.getRow(1).height = 24;

	sheet.mergeCells(2, 1, 2, totalColumns);
	sheet.getCell(2, 1).value = `Asignación Académica ${pac}º Periodo Académico Presencial ${year}`;
	sheet.getCell(2, 1).font = { bold: true, size: 12 };
	sheet.getCell(2, 1).alignment = { horizontal: 'center' };

	sheet.mergeCells(3, 1, 3, totalColumns);
	sheet.getCell(3, 1).value = `Carrera o Área: ${departmentName}`;
	sheet.getCell(3, 1).font = { size: 10 };

	sheet.mergeCells(4, 1, 4, totalColumns);
	sheet.getCell(4, 1).value = `Responsable: ${responsible}`;
	sheet.getCell(4, 1).font = { size: 10 };

	const headerRow = sheet.getRow(5);
	headerRow.values = headers;
	headerRow.height = 18;

	for (let column = 1; column <= totalColumns; column++) {
		const cell = headerRow.getCell(column);
		cell.font = { bold: true, color: { argb: HEADER_FONT_COLOR } };
		cell.fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: { argb: HEADER_FILL },
		};
		cell.border = thinBorder(BORDER_BLACK);
		cell.alignment = {
			vertical: 'middle',
			horizontal: 'center',
			wrapText: true,
		};
	}

	data.forEach((info, i) => {
		const row = sheet.addRow([
			i + 1,
			sanitizeExcelCell(info.teacherCode),
			sanitizeExcelCell(info.teacherName),
			sanitizeExcelCell(info.courseCode),
			sanitizeExcelCell(info.courseName),
			info.section,
			info.uv,
			sanitizeExcelCell(info.days),
			info.studentCount ?? 'Sin información',
			sanitizeExcelCell(info.classroomName),
			sanitizeExcelCell(info.departmentName),
			sanitizeExcelCell(info.coordinator),
			sanitizeExcelCell(info.center),
			info.nearGraduation ? 'Sí' : 'No',
			sanitizeExcelCell(info.observation ?? ''),
		]);
		row.getCell(1).alignment = { horizontal: 'center' };

		for (let column = 1; column <= totalColumns; column++) {
			row.getCell(column).border = thinBorder(BORDER_LIGHT);
		}
	});

	const buffer = await workbook.xlsx.writeBuffer();
	const blob = new Blob([buffer], {
		type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	});

	downloadBlob(blob, `Planificación académica ${pac}PAC ${year}.xlsx`);
}