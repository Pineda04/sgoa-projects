import { TMonitorReportSummary } from '@api/monitor';
import {
	buildExportFileName,
	TMonitorReportExportRow,
} from './monitor-report-export.utils';

interface IExportMonitorReportExcelParams {
	rows: TMonitorReportExportRow[];
	summary: TMonitorReportSummary;
	dateFrom?: string;
	dateTo?: string;
}

const downloadBlob = (blob: Blob, fileName: string) => {
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = fileName;
	link.click();
	URL.revokeObjectURL(url);
};

export async function exportMonitorReportExcel({
	rows,
	summary,
	dateFrom,
	dateTo,
}: IExportMonitorReportExcelParams) {
	const ExcelJS = await import('exceljs');
	const workbook = new ExcelJS.Workbook();

	const incidentsSheet = workbook.addWorksheet('Incidencias');
	incidentsSheet.columns = [
		{ header: 'Fecha', key: 'fecha', width: 14 },
		{ header: 'Hora', key: 'hora', width: 10 },
		{ header: 'Aula', key: 'aula', width: 16 },
		{ header: 'Edificio', key: 'edificio', width: 20 },
		{ header: 'Docente', key: 'docente', width: 28 },
		{ header: 'Estado', key: 'estado', width: 12 },
		{ header: 'Observaciones', key: 'observaciones', width: 32 },
	];
	incidentsSheet.getRow(1).font = { bold: true };
	incidentsSheet.addRows(rows);

	const summarySheet = workbook.addWorksheet('Resumen');
	summarySheet.columns = [
		{ header: 'Indicador', key: 'label', width: 24 },
		{ header: 'Valor', key: 'value', width: 16 },
	];
	summarySheet.getRow(1).font = { bold: true };
	summarySheet.addRows([
		{ label: 'Periodo', value: `${dateFrom ?? '-'} al ${dateTo ?? '-'}` },
		{ label: 'Total chequeos', value: summary.totalChecks },
		{ label: 'Presentes', value: summary.present },
		{ label: 'Ausentes', value: summary.absent },
		{ label: '% Cumplimiento', value: `${summary.complianceRate.toFixed(1)}%` },
	]);

	const buffer = await workbook.xlsx.writeBuffer();
	const blob = new Blob([buffer], {
		type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	});

	downloadBlob(blob, buildExportFileName('xlsx', dateFrom, dateTo));
}
