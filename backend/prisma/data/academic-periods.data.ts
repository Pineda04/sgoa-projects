interface AcademicPeriod {
  year: number;
  pac: number;
  startDate: Date;
  endDate: Date;
  pac_modality: 'Trimestre' | 'Semestre';
}

export const academicPeriodsSeed: AcademicPeriod[] = [
  {
    year: 2025,
    pac: 1,
    startDate: new Date(2025, 0, 13), // 13 de enero
    endDate: new Date(2025, 4, 11), // 11 de mayo
    pac_modality: 'Trimestre',
  },
  {
    year: 2025,
    pac: 2,
    startDate: new Date(2025, 4, 12), // 12 de mayo
    endDate: new Date(2025, 7, 31), // 31 de agosto
    pac_modality: 'Trimestre',
  },
  {
    year: 2025,
    pac: 3,
    startDate: new Date(2025, 8, 1), // 1 de septiembre
    endDate: new Date(2025, 11, 20), // 20 de diciembre
    pac_modality: 'Trimestre',
  },
  {
    year: 2026,
    pac: 1,
    startDate: new Date(2026, 0, 13), // 13 de enero
    endDate: new Date(2026, 4, 11), // 11 de mayo
    pac_modality: 'Trimestre',
  },
  {
    year: 2026,
    pac: 2,
    startDate: new Date(2026, 4, 12), // 12 de mayo
    endDate: new Date(2026, 7, 31), // 31 de agosto
    pac_modality: 'Trimestre',
  },
  {
    year: 2026,
    pac: 3,
    startDate: new Date(2026, 8, 1), // 1 de septiembre
    endDate: new Date(2026, 11, 20), // 20 de diciembre
    pac_modality: 'Trimestre',
  },
  {
    year: 2027,
    pac: 1,
    startDate: new Date(2027, 0, 13), // 13 de enero
    endDate: new Date(2027, 4, 11), // 11 de mayo
    pac_modality: 'Trimestre',
  },
  {
    year: 2027,
    pac: 2,
    startDate: new Date(2027, 4, 12), // 12 de mayo
    endDate: new Date(2027, 7, 31), // 31 de agosto
    pac_modality: 'Trimestre',
  },
  {
    year: 2027,
    pac: 3,
    startDate: new Date(2027, 8, 1), // 1 de septiembre
    endDate: new Date(2027, 11, 20), // 20 de diciembre
    pac_modality: 'Trimestre',
  },
  {
    year: 2028,
    pac: 1,
    startDate: new Date(2028, 0, 13), // 13 de enero
    endDate: new Date(2028, 4, 11), // 11 de mayo
    pac_modality: 'Trimestre',
  },
  {
    year: 2028,
    pac: 2,
    startDate: new Date(2028, 4, 12), // 12 de mayo
    endDate: new Date(2028, 7, 31), // 31 de agosto
    pac_modality: 'Trimestre',
  },
  {
    year: 2028,
    pac: 3,
    startDate: new Date(2028, 8, 1), // 1 de septiembre
    endDate: new Date(2028, 11, 20), // 20 de diciembre
    pac_modality: 'Trimestre',
  },
]
;
