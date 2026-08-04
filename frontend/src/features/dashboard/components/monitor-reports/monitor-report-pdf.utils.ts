import { TMonitorReportSummary } from '@api/monitor';
import { getJsPdfFontName, getPdfFontPreference } from '@config/lib';
import {
	buildExportFileName,
	EXPORT_COLUMN_HEADERS,
	TMonitorReportExportRow,
} from './monitor-report-export.utils';

interface IExportMonitorReportPdfParams {
	rows: TMonitorReportExportRow[];
	summary: TMonitorReportSummary;
	dateFrom?: string;
	dateTo?: string;
}

export async function exportMonitorReportPdf({
	rows,
	summary,
	dateFrom,
	dateTo,
}: IExportMonitorReportPdfParams) {
	const [jsPDFModule, autoTableModule] = await Promise.all([
		import('jspdf'),
		import('jspdf-autotable'),
	]);
	const JsPDF = jsPDFModule.default;
	const autoTable = autoTableModule.default;

	const jsPdfFont = getJsPdfFontName(getPdfFontPreference());

	const doc = new JsPDF('l', 'pt', 'a4');
	const pageWidth = doc.internal.pageSize.width;

	doc.setFont(jsPdfFont, 'bold');
	doc.setFontSize(14);
	doc.text('Reporte de Cumplimiento — Monitoreo', pageWidth / 2, 40, {
		align: 'center',
	});

	doc.setFont(jsPdfFont, 'normal');
	doc.setFontSize(10);
	doc.text(
		`Periodo: ${dateFrom ?? '-'} al ${dateTo ?? '-'}`,
		pageWidth / 2,
		58,
		{ align: 'center' }
	);

	autoTable(doc, {
		startY: 75,
		head: [EXPORT_COLUMN_HEADERS],
		body: rows.map(row => [
			row.fecha,
			row.hora,
			row.aula,
			row.edificio,
			row.docente,
			row.estado,
			row.observaciones,
		]),
		styles: { fontSize: 9, font: jsPdfFont },
		headStyles: { fillColor: [20, 76, 116], textColor: 255 },
		theme: 'striped',
		margin: { left: 40, right: 40 },
	});

	const lastTable = (doc as unknown as { lastAutoTable?: { finalY: number } })
		.lastAutoTable;
	const summaryStartY = (lastTable?.finalY ?? 75) + 20;

	autoTable(doc, {
		startY: summaryStartY,
		head: [['Resumen', '']],
		body: [
			['Total chequeos', String(summary.totalChecks)],
			['Presentes', String(summary.present)],
			['Ausentes', String(summary.absent)],
			[
				'% Cumplimiento',
				summary.complianceRate === null
					? 'No calculable'
					: `${summary.complianceRate.toFixed(1)}%`,
			],
		],
		styles: { fontSize: 10, font: jsPdfFont },
		headStyles: { fillColor: [20, 76, 116], textColor: 255 },
		theme: 'striped',
		margin: { left: 40, right: pageWidth - 280 },
	});

	doc.save(buildExportFileName('pdf', dateFrom, dateTo));
}
