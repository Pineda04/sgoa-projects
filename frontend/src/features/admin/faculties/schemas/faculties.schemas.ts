import z from 'zod';

export const facultyCreateSchema = z.object({
    name: z
        .string()
        .min(1, 'El nombre de la facultad debe tener al menos 1 caracter.')
        .max(100, 'El nombre de la facultad no puede superar los 100 caracteres.'),
});

export const facultyUpdateSchema = z
    .object({
        ...facultyCreateSchema.shape,
    })
    .partial();

export type TCreateFaculty = z.infer<typeof facultyCreateSchema>;
export type TUpdateFaculty = z.infer<typeof facultyUpdateSchema>;

export const initialValuesFaculty: TCreateFaculty = {
    name: '',
};
