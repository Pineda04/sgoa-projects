import { TMonitorReportSummary } from '@api/monitor';
import { getJsPdfFontName, getPdfFontPreference } from '@config/lib';
import {
	buildExportFileName,
	EXPORT_COLUMN_HEADERS,
	TMonitorReportExportRow,
} from './monitor-report-export.utils';
import { formatCheckDate } from './monitor-reports.utils';

interface IExportMonitorReportPdfParams {
	rows: TMonitorReportExportRow[];
	summary: TMonitorReportSummary;
	dateFrom?: string;
	dateTo?: string;
	campusName?: string;
	periodTitle?: string;
	userName?: string;
	userEmail?: string;
}

export async function exportMonitorReportPdf({
	rows,
	summary,
	dateFrom,
	dateTo,
	campusName,
	periodTitle,
	userName,
	userEmail,
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
	doc.text('Reporte de Cumplimiento Académico', pageWidth / 2, 40, {
		align: 'center',
	});

	const labelStyle = {
		halign: 'left',
		fillColor: [20, 76, 116],
		textColor: 255,
		fontStyle: 'bold' as const,
	};

	autoTable(doc, {
		startY: 55,
		theme: 'striped',
		styles: { fontSize: 10, font: jsPdfFont },
		headStyles: { fillColor: [20, 76, 116], textColor: 255 },
		body: [
			[
				{ content: 'Centro Universitario', styles: labelStyle },
				campusName || '-',
				{ content: 'Periodo académico', styles: labelStyle },
				periodTitle || '-',
			],
			[
				{ content: 'Usuario', styles: labelStyle },
				userName || '-',
				{ content: 'Correo', styles: labelStyle },
				userEmail || '-',
			],
			[
				{ content: 'Fecha de Inicio', styles: labelStyle },
				{ content: formatCheckDate(dateFrom ?? '') },
				{ content: 'Fecha de Fin', styles: labelStyle },
				{ content: formatCheckDate(dateTo ?? '') },
			],
		] as Parameters<typeof autoTable>[0]['body'],
		margin: { left: 40, right: 40 },
	});

	const startY =
		((doc as unknown as { lastAutoTable?: { finalY: number } })
			.lastAutoTable?.finalY ?? 55) + 15;

	autoTable(doc, {
		startY,
		head: [EXPORT_COLUMN_HEADERS],
		body: rows.map(row => [
			row.fecha,
			row.hora,
			row.aula,
			row.edificio,
			row.docente,
			row.estado,
			row.pizarra,
			row.observaciones,
		]),
		styles: { fontSize: 9, font: jsPdfFont },
		headStyles: { fillColor: [20, 76, 116], textColor: 255 },
		theme: 'striped',
		margin: { left: 40, right: 40 },
	});

	doc.addPage();

	autoTable(doc, {
		startY: 40,
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
