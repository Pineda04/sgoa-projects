export class AcademicAssignmentReportDto {
  id: number;
  numeroEmpleado: string;
  nombre: string;
  codigo: string;
  asignatura: string;
  seccion: string;
  uv: number;
  dias: number;
  numeroAlumnos: number;
  numeroAula: number;
  carrera: string;
  coordinador: string;
  centro: string;
  observaciones?: string;
}

export type TAcademicAssignmentReport = Record<
  number,
  keyof AcademicAssignmentReportDto
>;

export const propertiesAcademicAssignmentReport: TAcademicAssignmentReport = {
  0: 'id',
  1: 'numeroEmpleado',
  2: 'nombre',
  3: 'codigo',
  4: 'asignatura',
  5: 'seccion',
  6: 'uv',
  7: 'dias',
  8: 'numeroAlumnos',
  9: 'numeroAula',
  10: 'carrera',
  11: 'coordinador',
  12: 'centro',
  13: 'observaciones',
};
