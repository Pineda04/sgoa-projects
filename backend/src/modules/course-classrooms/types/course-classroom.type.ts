export type TCourseClassroom = {
  id: string;
  courseId: string;
  classroomId: string;
  teachingSessionId: string;
  section: string;
  days: string;
  studentCount: number;
  modalityId: string;
  nearGraduation: boolean;
  groupCode: string;
  observation?: string | null;
  // course?: TCourse;
  // classroom?: TClassroom;
  // teachingSession?: TTeachingSession;
  // modality?: TModality;
  // courseStatistics?: TCourseStatistic[];
};

// Tipo para la creación
export type TCreateCourseClassroom = Omit<
  TCourseClassroom,
  | 'id'
  | 'course'
  | 'classroom'
  | 'teachingSession'
  | 'modality'
  | 'courseStatistics'
  | 'classroomId'
  | 'teachingSessionId'
  | 'groupCode'
> & {
  // TODO: revisar si esto afecta a la creacion de los cursos.
  classroomId: string;
  teachingSessionId?: string;
  groupCode?: string; // este se asigna por defecto en la base de datos
};

// Tipo para la actualización
export type TUpdateCourseClassroom = Partial<TCreateCourseClassroom> & {
  id: string;
};

export type TCourseClassroomSelectPeriod = Omit<
  TCourseClassroom,
  'studentCount' | 'modalityId' | 'nearGraduation' | 'teachingSessionId'
> & {
  teachingSession: {
    assignmentReport: {
      periodId: string;
      teacherId: string;
      teacher: {
        user: {
          id: string;
          code: string;
        };
      };
    };
  };
  course: {
    code: string;
    name: string;
  };
  classroom: {
    name: string;
    desks: number;
    maxCapacity: number | null;
  };
};
