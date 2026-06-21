export enum EActivityType {
  Research = "Investigación",
  Outreach = "Vinculación",
  EducationalInnovation = "Innovación Educativa",
  CurriculumDesignOrRedesign = "Diseño o Rediseño Curricular",
  OtherActivities = "Otras Actividades",
}

export enum EPogressLevel {
  PROPOSAL = "Propuesta",
  EXECUTION = "Ejecución",
  COMPLETED = "Finalizado",
}

export const activityRegistrationStatus: Record<EActivityType, boolean> = {
  [EActivityType.Research]: true,
  [EActivityType.Outreach]: true,
  [EActivityType.EducationalInnovation]: false,
  [EActivityType.CurriculumDesignOrRedesign]: false,
  [EActivityType.OtherActivities]: false,
};
