import { TCourse } from 'src/modules/course-classrooms/types';
import { TTeacher } from './teacher.type';
import { TCustomOmit } from 'src/common/types';

export type TTeacherPreference = {
  id: string;
  teacherId: string;
  startTime: string | Date;
  endTime: string | Date;
  preferredClasses: TTeacherPreferredClass[];
};

export type TTeacherPreferredClass = {
  id: string;
  courseId: string;
  teacherId: string;
  course?: TCourse;
  teacher?: TCustomOmit<TTeacher, 'undergradId' | 'postgradId'>;
};
