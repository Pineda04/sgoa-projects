import logoUNAH from '@assets/Logo-unah-3.png';
import logoSEDP from '@assets/SEDP_Logo.png';
import { EPdfFont, getJsPdfFontName, getPdfFontPreference } from '@lib/pdf-config';
import { toBase64, formatHour } from './pdf-helpers';
import { handleActivities } from '../activities';
import { EActivityType } from '../../constants';
import { IReportData, ILastAutoTable } from './types';
import {
	TCurrentAcademicPeriod,
	TOutputTeacher,
	TTeacherPosition,
} from '@features/teachers/types';

type JsPDF = import('jspdf').default;

const createTeacherInfo = (
	doc: JsPDF,
	y: number,
	teacherData: TOutputTeacher & {
		positionData: TTeacherPosition;
	},
	period: TCurrentAcademicPeriod,
	autoTable: typeof import('jspdf-autotable').default
) => {
	const commonStyles = {
		halign: 'left',
		fillColor: [20, 76, 116],
		textColor: 255,
		fontStyle: 'bold' as const,
	};

	autoTable(doc, {
		startY: y,
		theme: 'striped',
		styles: { halign: 'center', valign: 'middle', fontSize: 10 },
		// headStyles: {
		// 	fillColor: [20, 76, 116],
		// 	textColor: 255,
		// 	fontStyle: 'bold',
		// },
		headStyles: { fillColor: [20, 76, 116], textColor: 255 },
		body: [
			[
				{
					content: 'Centro Universitario',
					styles: commonStyles,
				},
				teacherData.positionData.center,
				{
					content: 'Facultad',
					styles: commonStyles,
				},
				teacherData.positionData.faculty,
				{
					content: 'Periodo académico',
					styles: commonStyles,
				},
				{
					content: `PAC No. ${period.pac}, ${period.year}`,
					styles: { fontStyle: 'bold' },
				},
			],
			[
				{
					content: 'Departamento',
					styles: commonStyles,
				},
				{ content: teacherData.positionData.department, colSpan: 5 },
			],
			[
				{
					content: 'Nombre del docente',
					styles: commonStyles,
				},
				{ content: teacherData.name, colSpan: 3 },
				{
					content: 'No. de Empleado',
					styles: commonStyles,
				},
				teacherData.code,
			],
			[
				{
					content: 'Formación Académica',
					styles: commonStyles,
				},
				teacherData.postgrads.length > 0 ? 'Maestría' : 'Pregrado',
				{
					content: 'Categoría docente',
					styles: commonStyles,
				},
				{ content: teacherData.categoryName, colSpan: 3 },
			],
			[
				{
					content: 'Jornada laboral',
					styles: commonStyles,
				},
				teacherData.contractTypeName.toUpperCase(),
				{
					content: 'Horario',
					styles: commonStyles,
				},
				{ content: teacherData.shiftName, colSpan: 3 },
			],
		] as Parameters<typeof autoTable>[0]['body'],
		margin: { left: 40, right: 40 },
	});

	// devolver dónde terminó
	const lastTable = (doc as unknown as { lastAutoTable?: ILastAutoTable })
		.lastAutoTable;
	return (lastTable?.finalY ?? y) + 20;
};

export async function exportReportActivities(
	data: IReportData,
	fontFamily?: EPdfFont
) {
	if (!data) return;

	const 	selectedFont = fontFamily ?? getPdfFontPreference();
	const jsPdfFont = getJsPdfFontName(selectedFont);

	const [jsPDFModule, autoTableModule] = await Promise.all([
		import('jspdf'),
		import('jspdf-autotable'),
	]);
	const JsPDF = jsPDFModule.default;
	const autoTable = autoTableModule.default;

	const logoUNAHB_B64 = await toBase64(logoUNAH);
	const logoSEDP_B64 = await toBase64(logoSEDP);

	//Hoja de papel A4
	const doc = new JsPDF('l', 'pt', 'a4');

	//Hoja de papel carta (Se necesita ajustar codigo en caso de cambiar)
	//const doc = new jsPDF('l', 'pt', 'letter');

	doc.setFontSize(14);
	doc.setFont(jsPdfFont, 'normal');

	const header = [
		'Universidad Nacional Autónoma de Honduras',
		'Secretaría Ejecutiva de Desarrollo de Personal',
		'Dirección de Carrera Docente',
		'Departamento de Evaluación y Monitoreo de la Carrera Docente',
		`Informe de Actividades de Asignación Académica PAC No. ${data.period.pac}, ${data.period.year}`,
	];

	const heightHeader = 100;

	//esto es el contenido del encabezado de las paginas
	const addHeader = (docInstance: JsPDF) => {
		docInstance.addImage(logoUNAHB_B64, 'PNG', 40, 20, 50, 70);
		docInstance.addImage(
			logoSEDP_B64,
			'PNG',
			docInstance.internal.pageSize.width - 160,
			20,
			120,
			60
		);
		docInstance.setFontSize(12);
		header.forEach((linea, i) => {
			docInstance.text(
				linea,
				docInstance.internal.pageSize.width / 2,
				40 + i * 15,
				{
					align: 'center',
				}
			);
		});
	};

	//Pone el primer encabezado
	addHeader(doc);
	let y = heightHeader + 30;

	// Encabezado de info docente
	doc.text('Información del Docente', 105, y, { align: 'center' });
	y += 10;

	y = createTeacherInfo(
		doc,
		y,
		{
			...data.teacherData,
			positionData: data.teacherPosition,
		},
		data.period,
		autoTable
	);

	//Esta parte es como se generan las tablas, asi solo se llama luego para cada tabla
	const createTable = (
		title: string,
		headers: string[],
		data: (string | number)[][]
	) => {
		//Titulo
		// doc.setFontSize(14);
		// doc.text(title, 40, y);
		// y += 10;
		y += 20;

		//Contenido de la tabla
		autoTable(doc, {
			startY: y,
			head: [
				[
					{
						content: title,
						colSpan: headers.length,
						styles: {
							halign: 'center',
							fillColor: [20, 76, 116],
							textColor: 255,
							fontStyle: 'bold',
						},
					},
				],
				headers.map(h => ({ content: h })),
			],
			body: data,
			styles: { fontSize: 10 },
			headStyles: { fillColor: [20, 76, 116], textColor: 255 },
			theme: 'striped',
			margin: { left: 40, right: 40, top: heightHeader + 20 },
			didDrawPage: () => {
				addHeader(doc);
			},
		});

		//Estos son para saber donde termina la tabla anterior y hacer espacio para la siguiente
		const lastTable = (doc as unknown as { lastAutoTable?: ILastAutoTable })
			.lastAutoTable;
		y = (lastTable?.finalY ?? y) + 20;
	};

	//Tabla de docencia
	y += 20;
	autoTable(doc, {
		startY: y,
		head: [
			[
				{
					content: '1. Docencia',
					colSpan: 9,
					styles: {
						halign: 'center',
						fillColor: [20, 76, 116],
						textColor: 255,
						fontStyle: 'bold',
					},
				},
			],
			[
				'Código de Asignatura',
				'Nombre del espacio de aprendizaje',
				'Sección',
				'UV',
				'APB',
				'RPB',
				'NSP',
				'ABD',
				'Total Alumnos',
			],
		],
		body: data.assignmentReportData.teachingSession.courseClassrooms.map(
			d => [
				d.course.code,
				d.course.name,
				d.section,
				d.course.uvs,
				d.courseStadistic.APB,
				d.courseStadistic.RPB,
				d.courseStadistic.NSP,
				d.courseStadistic.ABD,
				d.studentCount,
			]
		),
		//al final de la tabla para los horarios de consulta y tutoria
		foot: [
			[
				{
					content: `Hora de consulta: ${formatHour(
						data.assignmentReportData.teachingSession.consultHour
					)}`,
					colSpan: 1,
					styles: {
						halign: 'left',
						fillColor: [20, 76, 116],
						textColor: 255,
						fontStyle: 'bold',
					},
				},
				{
					content: `Hora de tutorías: ${formatHour(
						data.assignmentReportData.teachingSession.tutoringHour
					)}`,
					colSpan: 1,
					styles: {
						halign: 'left',
						fillColor: [20, 76, 116],
						textColor: 255,
						fontStyle: 'bold',
					},
				},
				{
					content: '',
					colSpan: 7,
					styles: { fillColor: [20, 76, 116] },
				},
			],
		],
		styles: { fontSize: 10 },
		headStyles: { fillColor: [20, 76, 116], textColor: 255 },
		theme: 'striped',
		margin: { left: 40, right: 40, top: heightHeader + 20 },
		didDrawPage: () => {
			addHeader(doc);
		},
	});

	y =
		((doc as unknown as { lastAutoTable?: ILastAutoTable }).lastAutoTable
			?.finalY ?? y) + 30;

	const activitiesResearch = handleActivities(
		data.assignmentReportData.complementaryActivities,
		EActivityType.Research
	);

	createTable(
		'2. ' + EActivityType.Research,
		[
			'No.',
			'Nombre',
			'Registrado',
			'No. de Expediente',
			'Nivel de Avance',
			'Verificación',
		],
		activitiesResearch.map((d, i) => [
			i + 1,
			d.name,
			d.isRegistered! ? 'Sí' : 'No',
			d.fileNumber!,
			d.progressLevel,
			d.verificationMedia.description,
		])
	);

	const activitiesOutreach = handleActivities(
		data.assignmentReportData.complementaryActivities,
		EActivityType.Outreach
	);

	createTable(
		'3. ' + EActivityType.Outreach,
		[
			'No.',
			'Nombre',
			'Registrado',
			'No. de Expediente',
			'Nivel de Avance',
			'Verificación',
		],
		activitiesOutreach.map((d, i) => [
			i + 1,
			d.name,
			d.isRegistered! ? 'Sí' : 'No',
			d.fileNumber!,
			d.progressLevel,
			d.verificationMedia.description,
		])
	);

	const activitiesEducationalInnovation = handleActivities(
		data.assignmentReportData.complementaryActivities,
		EActivityType.EducationalInnovation
	);

	createTable(
		'4. ' + EActivityType.EducationalInnovation,
		['No.', 'Nombre', 'Nivel de Avance', 'Verificación'],
		activitiesEducationalInnovation.map((d, i) => [
			i + 1,
			d.name,
			d.progressLevel,
			d.verificationMedia.description,
		])
	);

	const activitiesCurriculumDesignOrRedesign = handleActivities(
		data.assignmentReportData.complementaryActivities,
		EActivityType.CurriculumDesignOrRedesign
	);

	createTable(
		'5. ' + EActivityType.CurriculumDesignOrRedesign,
		['No.', 'Nombre', 'Nivel de Avance', 'Verificación'],
		activitiesCurriculumDesignOrRedesign.map((d, i) => [
			i + 1,
			d.name,
			d.progressLevel,
			!d.verificationMedia
				? 'Sin descripción...'
				: d.verificationMedia.description,
		])
	);

	//Cargo del docente
	y += 20;
	autoTable(doc, {
		startY: y,
		head: [['6. Cargo de gestión académica']],
		body: [[data.teacherPosition.position]],
		theme: 'striped',
		styles: { halign: 'center', valign: 'middle', fontSize: 10 },
		headStyles: { fillColor: [20, 76, 116], textColor: 255 },
		margin: { left: 40, right: 40 },
	});
	const lastTable = (doc as unknown as { lastAutoTable?: ILastAutoTable })
		.lastAutoTable;
	y = (lastTable?.finalY ?? y) + 20;

	const activitiesOther = handleActivities(
		data.assignmentReportData.complementaryActivities,
		EActivityType.OtherActivities
	);

	createTable(
		'7. ' + EActivityType.OtherActivities,
		['No.', 'Nombre', 'Nivel de Avance', 'Verificación'],
		activitiesOther.map((d, i) => [
			i + 1,
			d.name,
			d.progressLevel,
			d.verificationMedia.description,
		])
	);

	//Espacio para firmas
	y += 25;
	const marginLeft = 330;
	const lineWidth = 200;
	const firmaHeight = 70;

	const pageSize = doc.internal.pageSize;
	const pageHeight = pageSize.getHeight();
	const marginBottom = 45;

	if (y + firmaHeight > pageHeight - marginBottom) {
		doc.addPage();
		y = 40;
	}

	doc.line(marginLeft, y, marginLeft + lineWidth, y);
	doc.setFontSize(10);
	doc.text('Firma del docente', marginLeft + lineWidth / 2, y + 18, {
		align: 'center',
	});

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
	const fileName =
		data.teacherData.name +
		' ' +
		data.period.pac +
		'PAC ' +
		data.period.year +
		' Informe de actividades académicas.pdf';

	doc.save(fileName);
}
