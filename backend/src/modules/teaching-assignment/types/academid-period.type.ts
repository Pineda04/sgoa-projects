export type TAcademicPeriod = {
  id: string;
  year: number;
  pac: number;
  pac_modality: string;
  startDate: Date;
  endDate: Date;
  // assignmentReports?: TAcademicAssignmentReport[]; // Assuming you have this type defined
};

// Tipo para la creación
export type TCreateAcademicPeriod = Omit<
  TAcademicPeriod,
  'id' | 'assignmentReports'
>;

// Tipo para la actualización
export type TUpdateAcademicPeriod = Partial<TCreateAcademicPeriod>;

export type TPacModality = 'Trimestre' | 'Semestre';
