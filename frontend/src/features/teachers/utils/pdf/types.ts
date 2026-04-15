import {
	TOutputTeacher,
	TAssignmentReport,
	TCurrentAcademicPeriod,
	TTeacherPosition,
} from '@features/teachers/types';

export interface ILastAutoTable {
	finalY: number;
}

//Datos para exportar a pdf
export interface IReportData {
	// datosDocente: typeof datosDocente;
	// docencia: typeof datosDocencia;
	period: TCurrentAcademicPeriod;
	teacherData: TOutputTeacher;
	teacherPosition: TTeacherPosition;
	assignmentReportData: TAssignmentReport;
	// teachingSession: assignmentReportData;
	// research: TComplementaryActivity[];
	// outreach: "Vinculación";
	// educationalInnovation: "Innovación Educativa";
	// curriculumDesignOrRedesign: "Diseño o Rediseño Curricular";
	// otherActivities: "Otras Actividades";
	// investigacion: ActVinRow[];
	// vinculacion: ActVinRow[];
	// innovacion: ActividadesAdicionalesRow[];
	// disenoCurricular: ActividadesAdicionalesRow[];
	// otrasActividades: ActividadesAdicionalesRow[];
}
