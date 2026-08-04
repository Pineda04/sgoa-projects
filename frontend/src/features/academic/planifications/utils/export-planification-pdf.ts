import { TPlanification } from '@api/assignment-reports';
import { EPdfFont, getJsPdfFontName, getPdfFontPreference } from '@config/lib';

export async function exportPlanification(
	data: TPlanification[],
	pac: number,
	year: number,
	responsible: string,
	departmentName: string,
	fontFamily?: EPdfFont
) {
	const 	selectedFont = fontFamily ?? getPdfFontPreference();
	const jsPdfFont = getJsPdfFontName(selectedFont);

	const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
		import('jspdf'),
		import('jspdf-autotable'),
	]);

	const doc = new jsPDF('l', 'pt', 'legal');
	doc.setFont(jsPdfFont, 'normal');

	const marginLeft = 40;
	const headerY = 60;

	doc.setFontSize(16);
	doc.text('UNAH Campus Copán', doc.internal.pageSize.getWidth() / 2, 40, {
		align: 'center',
	});
	doc.setFontSize(12);
	doc.text(
		`Asignación Académica ${pac}º Periodo Académico Presencial ${year}`,
		doc.internal.pageSize.getWidth() / 2,
		60,
		{ align: 'center' }
	);
	doc.text(`Carrera o Área: ${departmentName}`, marginLeft, headerY + 20);
	doc.text(`Responsable: ${responsible}`, marginLeft, headerY + 35);

	const head = [
		[
			'#',
			'No.Emp',
			'Nombre',
			'Código',
			'Asignatura',
			'UV',
			'Sección',
			'No. Alumnos',
			'Días',
			'Centro / Telecentro',
			'N° de Aula',
			'Carrera o Área',
			'Jefe / Coordinador',
			'Estudiantes por graduarse',
			'Observaciones',
		],
	];

	const body = data.map((info, i) => [
		i + 1,
		info.teacherCode,
		info.teacherName,
		info.courseCode,
		info.courseName,
		info.uv,
		info.section,
		info.studentCount,
		info.days,
		info.center,
		info.classroomName,
		info.departmentName,
		info.coordinator,
		info.nearGraduation ? 'Sí' : 'No',
		info.observation ?? '',
	]);

	autoTable(doc, {
		head,
		body,
		startY: 120,
		styles: { fontSize: 8, cellPadding: 4 },
		headStyles: { fillColor: [20, 76, 116] },
	});

	type LastAutoTable = { finalY?: number };
	const lastTable = (doc as unknown as { lastAutoTable?: LastAutoTable })
		.lastAutoTable;
	const y = (lastTable?.finalY ?? headerY + 55) + 80;

	const lineWidth = 200;
	const marginCenter = (doc.internal.pageSize.getWidth() - lineWidth) / 2;

	const pageSize = doc.internal.pageSize;
	const pageHeight = pageSize.getHeight();
	const marginBottom = 45;
	const firmaHeight = 70;

	if (y + firmaHeight > pageHeight - marginBottom) {
		doc.addPage();
	}

	let firmaY = y;
	if (firmaY + firmaHeight > pageHeight - marginBottom) {
		doc.addPage();
		firmaY = 140;
	}

	doc.line(marginCenter, firmaY, marginCenter + lineWidth, firmaY);
	doc.setFontSize(10);
	doc.text(
		'Firma del coordinador de carrera',
		marginCenter + lineWidth / 2,
		firmaY + 18,
		{ align: 'center' }
	);

	const pageWidth = pageSize.getWidth();
	const finalTotalPages = doc.internal.pages.length - 1;

	for (let i = 1; i <= finalTotalPages; i++) {
		doc.setPage(i);
		doc.setFontSize(10);
		doc.setFont(jsPdfFont, 'normal');
		doc.text(`${i} de ${finalTotalPages}`, pageWidth - 50, pageHeight - 30, {
			align: 'right',
		});
	}

	const fileName = 'Planificación académica ' + pac + 'PAC ' + year;
	doc.save(fileName);
}
