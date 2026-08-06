import { TCreateCourse } from '@api/courses';
import type { FormikProps } from 'formik';

type TCourseFormValues = TCreateCourse;

export interface CourseFormInputsProps {
	formik: FormikProps<TCourseFormValues>;
	disabled?: boolean;
}

export const CourseFormInputs = ({
	formik,
	disabled = false,
}: CourseFormInputsProps) => {
	return (
		<>
			{/* Código */}
			<div className="space-y-2">
				<label
					htmlFor="code"
					className="text-sm font-medium text-foreground"
				>
					Código
				</label>
				<input
					id="code"
					type="text"
					name="code"
					value={formik.values.code ?? ''}
					onChange={formik.handleChange}
					onBlur={formik.handleBlur}
					disabled={disabled}
					placeholder="Ingrese el código"
					className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:text-muted-foreground"
				/>
				{formik.touched.code && formik.errors.code ? (
					<p className="text-xs text-destructive">
						{formik.errors.code}
					</p>
				) : null}
			</div>

			{/* Nombre */}
			<div className="space-y-2">
				<label
					htmlFor="name"
					className="text-sm font-medium text-foreground"
				>
					Nombre
				</label>
				<input
					id="name"
					type="text"
					name="name"
					value={formik.values.name ?? ''}
					onChange={formik.handleChange}
					onBlur={formik.handleBlur}
					disabled={disabled}
					placeholder="Ingrese el nombre"
					className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:text-muted-foreground"
				/>
				{formik.touched.name && formik.errors.name ? (
					<p className="text-xs text-destructive">
						{formik.errors.name}
					</p>
				) : null}
			</div>

			{/* UVs */}
			<div className="space-y-2">
				<label
					htmlFor="uvs"
					className="text-sm font-medium text-foreground"
				>
					UVs
				</label>
				<input
					id="uvs"
					type="number"
					name="uvs"
					min={1}
					max={5}
					value={formik.values.uvs ?? ''}
					onChange={formik.handleChange}
					onBlur={formik.handleBlur}
					disabled={disabled}
					placeholder="1-5"
					className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:text-muted-foreground"
				/>
				{formik.touched.uvs && formik.errors.uvs ? (
					<p className="text-xs text-destructive">
						{formik.errors.uvs}
					</p>
				) : null}
			</div>

			{/* Estado */}
			<div className="space-y-2">
				<label className="text-sm font-medium text-foreground">
					Estado
				</label>
				<label className="flex items-center gap-3 cursor-pointer mt-2">
					<div className="relative">
						<input
							type="checkbox"
							name="activeStatus"
							checked={formik.values.activeStatus ?? true}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							disabled={disabled}
							className="sr-only peer"
						/>
						<div className="w-11 h-6 bg-muted border border-border rounded-full peer-checked:bg-green-600 peer-checked:border-green-600 transition-colors" />
						<div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform peer-checked:translate-x-5" />
					</div>
					<span className="text-sm text-foreground peer-disabled:text-muted-foreground">
						{formik.values.activeStatus ? 'Activo' : 'Inactivo'}
					</span>
				</label>
			</div>
		</>
	);
};
