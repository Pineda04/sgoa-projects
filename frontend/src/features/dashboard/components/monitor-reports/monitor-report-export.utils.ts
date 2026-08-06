import { TScheduleComplianceCheckDetail } from '@api/monitor';
import { formatCheckDate } from './monitor-reports.utils';
import { formatBlackboardUse } from './monitor-reports.utils';

export const EXPORT_ALL_CHECKS_SIZE = 5000;

export const EXPORT_COLUMN_HEADERS = [
	'Fecha',
	'Hora',
	'Aula',
	'Edificio',
	'Docente',
	'Estado',
	'Pizarra digital',
	'Observaciones',
];

export type TMonitorReportExportRow = {
	fecha: string;
	hora: string;
	aula: string;
	edificio: string;
	docente: string;
	estado: string;
	pizarra: string;
	observaciones: string;
};

export const buildExportRows = (
	data: TScheduleComplianceCheckDetail[]
): TMonitorReportExportRow[] =>
	data.map(row => ({
		fecha: formatCheckDate(row.checkDate),
		hora: row.checkTime,
		aula: row.courseClassroom.classroom.name,
		edificio: row.courseClassroom.classroom.building.name,
		docente: row.courseClassroom.teacher.name,
		estado: row.isPresent ? 'Presente' : 'Ausente',
		pizarra: formatBlackboardUse(row.digitalBlackboardUseStatus),
		observaciones: row.observation || '-',
	}));

export const buildExportFileName = (
	extension: 'pdf' | 'xlsx',
	dateFrom?: string,
	dateTo?: string
): string =>
	`Reporte-Monitoreo_${dateFrom ?? '-'}_${dateTo ?? '-'}.${extension}`;
