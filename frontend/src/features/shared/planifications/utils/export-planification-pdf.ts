import { TPlanification } from '../../../coordinators/schemas/planification.schemas';
import { EPdfFont, getJsPdfFontName, getPdfFontPreference } from '@lib/pdf-config';

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

	//Tamano de papel y fuente
	const doc = new jsPDF('l', 'pt', 'legal');
	doc.setFont(jsPdfFont, 'normal');

	const marginLeft = 40;
	const headerY = 60;

	//Encabezado de pagina
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

	//Encabezados de tabla
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

	// Filas de tabla
	const body = data.map((info, i) => [
		i + 1,
		info.teacherName,
		info.teacherCode,
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
		info.nearGraduation,
		info.observation,
	]);

	

	autoTable(doc, {
		head,
		body,
		startY: 120,
		styles: { fontSize: 8, cellPadding: 4 },
		headStyles: { fillColor: [20, 76, 116] },
	});

	// Espacio para firma
	type LastAutoTable = { finalY?: number };
	const lastTable = (doc as unknown as { lastAutoTable?: LastAutoTable })
		.lastAutoTable;
	const y = (lastTable?.finalY ?? headerY + 55) + 45;

	const lineWidth = 200;
	const marginCenter = (doc.internal.pageSize.getWidth() - lineWidth) / 2;

	const pageSize = doc.internal.pageSize;
	const pageHeight = pageSize.getHeight();
	const marginBottom = 45;
	const firmaHeight = 70;

	if (y + firmaHeight > pageHeight - marginBottom) {
		doc.addPage();
	}

	const newY = (doc as unknown as { lastAutoTable?: LastAutoTable })
		.lastAutoTable?.finalY ?? y;

	doc.line(marginCenter, newY, marginCenter + lineWidth, newY);
	doc.setFontSize(10);
	doc.text(
		'Firma del coordinador de carrera',
		marginCenter + lineWidth / 2,
		newY + 18,
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

	//Formato para el archivo
	const fileName = 'Planificación académica ' + pac + 'PAC ' + year;
	doc.save(fileName);
}
