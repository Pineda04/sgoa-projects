import z from 'zod';

const fileSizeLimit = 10 * 1024 * 1024; // 10 MB

export const fileUploadSchema = z.object({
	files: z
		.instanceof(FileList)
		.refine(list => list.length > 0, 'Sin archivos seleccionados')
		.refine(list => list.length <= 5, 'Máximo 5 archivos')
		.transform(list => Array.from(list))
		.refine(
			files => {
				const allowedTypes: { [key: string]: boolean } = {
					'image/jpeg': true,
					'image/png': true,
					'application/pdf': true,
					'application/msword': true,
					'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true,
					'application/vnd.ms-excel': true, // .xls
					'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': true, // .xlsx
				};
				return files.every(file => allowedTypes[file.type]);
			},
			{
				message:
					'Tipo de archivo no válido. Tipos de permitidos: JPG, PNG, PDF, DOC, DOCX, XLS y XLSX',
			}
		)
		.refine(
			files => {
				return files.every(file => file.size <= fileSizeLimit);
			},
			{
				message: 'El archivo excedió el límite de 10 MB.',
			}
		),
});

export type TFileUpload = z.infer<typeof fileUploadSchema>;
