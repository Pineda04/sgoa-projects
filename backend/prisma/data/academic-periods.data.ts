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
    year: 2026,
    pac: 1,
    startDate: new Date(2026, 0, 10), // 10 de enero
    endDate: new Date(2026, 5, 25), // 25 de junio
    pac_modality: 'Semestre',
  },
  {
    year: 2026,
    pac: 2,
    startDate: new Date(2026, 6, 1), // 1 de julio
    endDate: new Date(2026, 11, 20), // 20 de diciembre
    pac_modality: 'Semestre',
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
    year: 2027,
    pac: 1,
    startDate: new Date(2027, 0, 10), // 10 de enero
    endDate: new Date(2027, 5, 25), // 25 de junio
    pac_modality: 'Semestre',
  },
  {
    year: 2027,
    pac: 2,
    startDate: new Date(2027, 6, 1), // 1 de julio
    endDate: new Date(2027, 11, 20), // 20 de diciembre
    pac_modality: 'Semestre',
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
  {
    year: 2029,
    pac: 1,
    startDate: new Date(2029, 0, 13), // 13 de enero
    endDate: new Date(2029, 4, 11), // 11 de mayo
    pac_modality: 'Trimestre',
  },
  {
    year: 2029,
    pac: 2,
    startDate: new Date(2029, 4, 12), // 12 de mayo
    endDate: new Date(2029, 7, 31), // 31 de agosto
    pac_modality: 'Trimestre',
  },
  {
    year: 2029,
    pac: 3,
    startDate: new Date(2029, 8, 1), // 1 de septiembre
    endDate: new Date(2029, 11, 20), // 20 de diciembre
    pac_modality: 'Trimestre',
  },
  {
    year: 2029,
    pac: 1,
    startDate: new Date(2029, 0, 10), // 10 de enero
    endDate: new Date(2029, 5, 25), // 25 de junio
    pac_modality: 'Semestre',
  },
  {
    year: 2029,
    pac: 2,
    startDate: new Date(2029, 6, 1), // 1 de julio
    endDate: new Date(2029, 11, 20), // 20 de diciembre
    pac_modality: 'Semestre',
  },
  {
    year: 2030,
    pac: 1,
    startDate: new Date(2030, 0, 13), // 13 de enero
    endDate: new Date(2030, 4, 11), // 11 de mayo
    pac_modality: 'Trimestre',
  },
  {
    year: 2030,
    pac: 2,
    startDate: new Date(2030, 4, 12), // 12 de mayo
    endDate: new Date(2030, 7, 31), // 31 de agosto
    pac_modality: 'Trimestre',
  },
  {
    year: 2030,
    pac: 3,
    startDate: new Date(2030, 8, 1), // 1 de septiembre
    endDate: new Date(2030, 11, 20), // 20 de diciembre
    pac_modality: 'Trimestre',
  },
  {
    year: 2030,
    pac: 1,
    startDate: new Date(2030, 0, 10), // 10 de enero
    endDate: new Date(2030, 5, 25), // 25 de junio
    pac_modality: 'Semestre',
  },
  {
    year: 2030,
    pac: 2,
    startDate: new Date(2030, 6, 1), // 1 de julio
    endDate: new Date(2030, 11, 20), // 20 de diciembre
    pac_modality: 'Semestre',
  },
  {
    year: 2031,
    pac: 1,
    startDate: new Date(2031, 0, 13), // 13 de enero
    endDate: new Date(2031, 4, 11), // 11 de mayo
    pac_modality: 'Trimestre',
  },
  {
    year: 2031,
    pac: 2,
    startDate: new Date(2031, 4, 12), // 12 de mayo
    endDate: new Date(2031, 7, 31), // 31 de agosto
    pac_modality: 'Trimestre',
  },
  {
    year: 2031,
    pac: 3,
    startDate: new Date(2031, 8, 1), // 1 de septiembre
    endDate: new Date(2031, 11, 20), // 20 de diciembre
    pac_modality: 'Trimestre',
  },
  {
    year: 2031,
    pac: 1,
    startDate: new Date(2031, 0, 10), // 10 de enero
    endDate: new Date(2031, 5, 25), // 25 de junio
    pac_modality: 'Semestre',
  },
  {
    year: 2031,
    pac: 2,
    startDate: new Date(2031, 6, 1), // 1 de julio
    endDate: new Date(2031, 11, 20), // 20 de diciembre
    pac_modality: 'Semestre',
  },
  {
    year: 2032,
    pac: 1,
    startDate: new Date(2032, 0, 13), // 13 de enero
    endDate: new Date(2032, 4, 11), // 11 de mayo
    pac_modality: 'Trimestre',
  },
  {
    year: 2032,
    pac: 2,
    startDate: new Date(2032, 4, 12), // 12 de mayo
    endDate: new Date(2032, 7, 31), // 31 de agosto
    pac_modality: 'Trimestre',
  },
  {
    year: 2032,
    pac: 3,
    startDate: new Date(2032, 8, 1), // 1 de septiembre
    endDate: new Date(2032, 11, 20), // 20 de diciembre
    pac_modality: 'Trimestre',
  },
  {
    year: 2032,
    pac: 1,
    startDate: new Date(2032, 0, 10), // 10 de enero
    endDate: new Date(2032, 5, 25), // 25 de junio
    pac_modality: 'Semestre',
  },
  {
    year: 2032,
    pac: 2,
    startDate: new Date(2032, 6, 1), // 1 de julio
    endDate: new Date(2032, 11, 20), // 20 de diciembre
    pac_modality: 'Semestre',
  },

  {
    year: 2033,
    pac: 1,
    startDate: new Date(2033, 0, 13), // 13 de enero
    endDate: new Date(2033, 4, 11), // 11 de mayo
    pac_modality: 'Trimestre',
  },
  {
    year: 2033,
    pac: 2,
    startDate: new Date(2033, 4, 12), // 12 de mayo
    endDate: new Date(2033, 7, 31), // 31 de agosto
    pac_modality: 'Trimestre',
  },
  {
    year: 2033,
    pac: 3,
    startDate: new Date(2033, 8, 1), // 1 de septiembre
    endDate: new Date(2033, 11, 20), // 20 de diciembre
    pac_modality: 'Trimestre',
  },
  {
    year: 2033,
    pac: 1,
    startDate: new Date(2033, 0, 10), // 10 de enero
    endDate: new Date(2033, 5, 25), // 25 de junio
    pac_modality: 'Semestre',
  },
  {
    year: 2033,
    pac: 2,
    startDate: new Date(2033, 6, 1), // 1 de julio
    endDate: new Date(2033, 11, 20), // 20 de diciembre
    pac_modality: 'Semestre',
  },
  {
    year: 2034,
    pac: 1,
    startDate: new Date(2034, 0, 13), // 13 de enero
    endDate: new Date(2034, 4, 11), // 11 de mayo
    pac_modality: 'Trimestre',
  },
  {
    year: 2034,
    pac: 2,
    startDate: new Date(2034, 4, 12), // 12 de mayo
    endDate: new Date(2034, 7, 31), // 31 de agosto
    pac_modality: 'Trimestre',
  },
  {
    year: 2034,
    pac: 3,
    startDate: new Date(2034, 8, 1), // 1 de septiembre
    endDate: new Date(2034, 11, 20), // 20 de diciembre
    pac_modality: 'Trimestre',
  },
  {
    year: 2034,
    pac: 1,
    startDate: new Date(2034, 0, 10), // 10 de enero
    endDate: new Date(2034, 5, 25), // 25 de junio
    pac_modality: 'Semestre',
  },
  {
    year: 2034,
    pac: 2,
    startDate: new Date(2034, 6, 1), // 1 de julio
    endDate: new Date(2034, 11, 20), // 20 de diciembre
    pac_modality: 'Semestre',
  },
  {
    year: 2035,
    pac: 1,
    startDate: new Date(2035, 0, 13), // 13 de enero
    endDate: new Date(2035, 4, 11), // 11 de mayo
    pac_modality: 'Trimestre',
  },
  {
    year: 2035,
    pac: 2,
    startDate: new Date(2035, 4, 12), // 12 de mayo
    endDate: new Date(2035, 7, 31), // 31 de agosto
    pac_modality: 'Trimestre',
  },
  {
    year: 2035,
    pac: 3,
    startDate: new Date(2035, 8, 1), // 1 de septiembre
    endDate: new Date(2035, 11, 20), // 20 de diciembre
    pac_modality: 'Trimestre',
  },
  {
    year: 2035,
    pac: 1,
    startDate: new Date(2035, 0, 10), // 10 de enero
    endDate: new Date(2035, 5, 25), // 25 de junio
    pac_modality: 'Semestre',
  },
  {
    year: 2035,
    pac: 2,
    startDate: new Date(2035, 6, 1), // 1 de julio
    endDate: new Date(2035, 11, 20), // 20 de diciembre
    pac_modality: 'Semestre',
  },
]
;
