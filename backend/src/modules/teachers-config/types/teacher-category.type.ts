export type TTeacherCategory = {
  id: string;
  name: string;
  description: string | null;
};

// export type TCreateTeacherCategory = Omit<TTeacherCategory, 'id' | 'teachers'>;
// export type TUpdateTeacherCategory = Partial<TCreateTeacherCategory>;
