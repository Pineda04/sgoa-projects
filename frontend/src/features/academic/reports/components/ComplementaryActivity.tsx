import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { errorsFormik, ESwalIcons, genericAlert } from '@shared/utils';
import { fileUploadSchema, TFileUpload } from '@shared/schemas';
import { Button, Error, Loading, RadioButton } from '@shared/components';
import { PreviewImages } from '@features/academic/reports';
import { complementaryActivitySchema } from '../schemas';
import {
	activityRegistrationStatus,
	EActivityType,
	EPogressLevel,
} from '@shared/constants';
import {
	TComplementaryActivity,
	TCreateComplementaryActivity,
	useCreateComplementaryActivity,
	useUpdateComplementaryActivity,
} from '@api/activities';
import { FiSave } from 'react-icons/fi';

const MAX_FILES = 5;

const handleInitialValues = (
	reportId: string,
	activityType: EActivityType,
	isRegisteredActivity: boolean,
	initialValuesData?: TComplementaryActivity
) => ({
	name: initialValuesData ? initialValuesData.name : '',
	activityType,
	progressLevel: initialValuesData
		? (initialValuesData.progressLevel as EPogressLevel)
		: null,
	description: initialValuesData
		? initialValuesData.verificationMedia.description
		: '',
	extraFieldsEnabled: isRegisteredActivity,
	isRegistered: isRegisteredActivity
		? initialValuesData
			? initialValuesData.isRegistered!
			: false
		: undefined,
	fileNumber: isRegisteredActivity
		? initialValuesData
			? initialValuesData.fileNumber
			: ''
		: undefined,
	assignmentReportId: reportId,
});

export const ComplementaryActivity = ({
	reportId,
	activityType,
	onClose,
	initialValuesData,
}: {
	reportId: string;
	activityType: EActivityType;
	onClose: () => void;
	initialValuesData?: TComplementaryActivity;
}) => {
	const { addComplementaryActivity } =
		useCreateComplementaryActivity(reportId);
	const { updateComplementaryActivity, isPendingUpdate } =
		useUpdateComplementaryActivity(reportId);

	const isRegisteredActivity = activityRegistrationStatus[activityType];
	const [initialValues, setInitialValues] = useState(
		handleInitialValues(
			reportId,
			activityType,
			isRegisteredActivity,
			initialValuesData
		)
	);

	// 0 false | 1 true
	const [selectedValueRegister, setSelectedValueRegister] = useState<string>(
		initialValuesData && isRegisteredActivity
			? String(+initialValuesData.isRegistered!)
			: ''
	);
	const [files, setFiles] = useState<File[]>([]);
	const [errorsFiles, setErrorsFiles] = useState<Record<
		string | number | symbol,
		string
	> | null>(null);

	const {
		values,
		setValues,
		touched,
		errors,
		handleChange,
		handleBlur,
		handleSubmit,
		resetForm,
	} = useFormik<TCreateComplementaryActivity>({
		enableReinitialize: true,
		initialValues,
		onSubmit: values => onSubmitting(values),
		validateOnChange: true,
		validate: values => {
			const result = complementaryActivitySchema.safeParse(values);

			if (result.success) return;

			return errorsFormik<TCreateComplementaryActivity>(result);
		},
	});

	useEffect(() => {
		if (initialValuesData)
			setInitialValues(
				handleInitialValues(
					reportId,
					activityType,
					isRegisteredActivity,
					initialValuesData
				)
			);
	}, [initialValuesData, activityType, isRegisteredActivity, reportId]);

	const handleChangeRegister = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setSelectedValueRegister(event.target.value);
		setValues({ ...values, isRegistered: Boolean(+event.target.value) });
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (files.length === MAX_FILES)
			return genericAlert(
				`Sólo se permiten ${MAX_FILES} archivos.`,
				ESwalIcons.ERROR
			);

		const newFiles = event.currentTarget.files;
		if (!newFiles) return;

		const result = fileUploadSchema.safeParse({ files: newFiles });

		if (!result.success)
			return setErrorsFiles(errorsFormik<TFileUpload>(result));

		const exists = result.data.files.some(rf =>
			files.some(f => f.name === rf.name)
		);

		if (exists)
			return genericAlert(
				'El archivo ya se encuentra seleccionado.',
				ESwalIcons.ERROR
			);

		setFiles(prev => [...prev, ...result.data.files]);
		setErrorsFiles(null);
	};

	const handleFileDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
		setFiles(files.filter(f => f.name !== event.currentTarget.id));
	};

	const onSubmitting = async (values: TCreateComplementaryActivity) => {
		const formData = new FormData();

		// Campos obligatorios
		formData.append('assignmentReportId', values.assignmentReportId);
		formData.append('name', values.name);
		formData.append('activityType', values.activityType);
		formData.append('progressLevel', values.progressLevel ?? '');
		formData.append('description', values.description);

		// isRegistered: validar si es booleano
		if (typeof values.isRegistered === 'boolean')
			formData.append('isRegistered', String(values.isRegistered));
		else formData.append('isRegistered', 'undefined');

		if (values.fileNumber && values.fileNumber.trim() !== '')
			formData.append('fileNumber', values.fileNumber);
		else formData.append('fileNumber', '');

		files.forEach(file => {
			formData.append('files', file);
		});

		if (!initialValuesData) {
			await addComplementaryActivity(formData);

			onClose();
		} else {
			await updateComplementaryActivity({
				id: initialValuesData.id,
				formData,
			});
		}

		resetForm({
			values: initialValues,
		});

		setFiles([]);
	};

	const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		handleSubmit();
	};

	return (
		<>
			{isPendingUpdate && <Loading />}
			<h1 className="text-xl font-bold mb-5">{activityType}</h1>
			<hr className="h-px my-2 bg-gray-200 border-0 dark:bg-gray-300"></hr>
			<div
				className="h-[60vh] overflow-auto"
				id="form-complementary-activity"
				// onSubmit={handleSubmit}
			>
				<div className="mb-5">
					<label className="block mb-2 font-bold" htmlFor="name">
						Nombre del proyecto
					</label>
					<input
						type="text"
						id="name"
						name="name"
						className="w-full bg-gray-100 shadow-md rounded-lg px-2 py-2 outline-none"
						placeholder="Ingrese el nombre del proyecto"
						onBlur={handleBlur}
						value={values.name}
						onChange={handleChange}
					/>
					{touched.name && errors.name && (
						<Error error={errors.name} />
					)}
				</div>
				{/* Esta parte es la opcional */}
				{isRegisteredActivity && (
					<div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-[1fr_3fr]">
						<div className="mb-3">
							<label
								className="block mb-2 font-bold"
								htmlFor="register"
							>
								¿Registrado?
							</label>
							<div className="flex space-x-10 items-center justify-items-center">
								<RadioButton
									id="register-yes"
									label="Si"
									value="1"
									currentValue={selectedValueRegister}
									onChange={handleChangeRegister}
								/>
								<RadioButton
									id="register-no"
									label="No"
									value="0"
									currentValue={selectedValueRegister}
									onChange={handleChangeRegister}
								/>
							</div>
							{touched.isRegistered && errors.isRegistered && (
								<Error error={errors.isRegistered} />
							)}
						</div>
						<div>
							<label
								className="block mb-2 font-bold"
								htmlFor="fileNumber"
							>
								No. de expediente
							</label>
							<input
								type="text"
								id="fileNumber"
								name="fileNumber"
								className="w-full bg-gray-100 shadow-md rounded-lg px-2 py-2 outline-none mb-3"
								placeholder="Ingrese el número de expediente si esta se encuentra registrada"
								onBlur={handleBlur}
								value={values.fileNumber ?? ''}
								onChange={handleChange}
							/>
							{touched.fileNumber && errors.fileNumber && (
								<Error error={errors.fileNumber} />
							)}
						</div>
					</div>
				)}
				<div>
					<div className="mt-2">
						<label
							className="block mb-2 font-bold"
							htmlFor="progressLevel"
						>
							Nivel de avance
						</label>
						<select
							name="progressLevel"
							id="progressLevel"
							className="w-full bg-gray-100 shadow-md rounded-lg px-2 py-2 outline-none mb-3 cursor-pointer"
							onBlur={handleBlur}
							value={values.progressLevel ?? ''}
							onChange={handleChange}
						>
							<option disabled selected>
								Seleccione...
							</option>
							{Object.values(EPogressLevel).map(
								(value, index) => (
									<option key={index} value={value}>
										{value}
									</option>
								)
							)}
						</select>
						{touched.progressLevel && errors.progressLevel && (
							<Error error={errors.progressLevel} />
						)}
					</div>
				</div>

				{/* Archivos */}
				<div>
					<div className="mt-2">
						<label
							className="block mb-2 font-bold"
							htmlFor="description"
						>
							Medio de verificación
						</label>
						<input
							type="text"
							id="description"
							name="description"
							className="w-full bg-gray-100 shadow-md rounded-lg px-2 py-2 outline-none mb-3"
							placeholder="Ingrese una descripción del medio de verificación"
							onBlur={handleBlur}
							value={values.description}
							onChange={handleChange}
						/>
						{touched.description && errors.description && (
							<Error error={errors.description} />
						)}
					</div>
					<div>
						{!initialValuesData && (
							<div
								className="flex items-center justify-center w-full"
								hidden={files.length === MAX_FILES}
							>
								<label
									htmlFor="dropzone-file"
									className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-100"
								>
									<div className="flex flex-col items-center justify-center pt-5 pb-6">
										<svg
											className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
											aria-hidden="true"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 20 16"
										>
											<path
												stroke="currentColor"
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
											/>
										</svg>
										<p className="mb-2 text-sm text-gray-500">
											<span className="font-semibold">
												Click para seleccionar
											</span>{' '}
											o arrastre y suelte
										</p>
										<p className="text-xs text-gray-500">
											PNG, JPG, PDF, XLSX Y DOCX (Máximo 5
											archivos y máximo 10 MB)
										</p>
									</div>
									<input
										id="dropzone-file"
										type="file"
										className="hidden"
										name="files"
										onChange={handleFileChange}
									/>
								</label>
							</div>
						)}
						{initialValuesData && (
							<PreviewImages
								reportId={reportId}
								verificationMedia={
									initialValuesData.verificationMedia
								}
								sizeSquare={32}
								isRemovable
							>
								<div hidden={files.length === MAX_FILES}>
									<label
										htmlFor="dropzone-file"
										className="flex flex-col items-center justify-center w-32 h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-100"
									>
										<div className="flex flex-col items-center justify-center pt-5 pb-6">
											<svg
												className="w-8 h-8 text-gray-500 dark:text-gray-400"
												aria-hidden="true"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 20 16"
											>
												<path
													stroke="currentColor"
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
												/>
											</svg>
										</div>
										<input
											id="dropzone-file"
											type="file"
											className="hidden"
											name="files"
											onChange={handleFileChange}
										/>
									</label>
								</div>
							</PreviewImages>
						)}
						{/* Lista de archivos seleccionados */}
						{Array.isArray(files) && files.length > 0 && (
							<div className="mt-3 text-sm text-gray-700 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
								{files.map((file, index) => (
									<Button
										key={index}
										id={file.name}
										type="button"
										className="cursor-pointer p-2 rounded-md hover:bg-red-200 w-full truncate"
										onClick={handleFileDelete}
										variant="unstyled"
									>
										📄 {file.name}
									</Button>
								))}
							</div>
						)}

						{/* Errores */}
						{errorsFiles && Object.keys(errorsFiles).length > 0 && (
							<ul className="mt-3 text-sm text-gray-700 space-y-1">
								{Object.entries(errorsFiles).map(
									([, err], index) => (
										<li
											key={index}
											value={index}
											className="flex items-center gap-2"
										>
											<Error error={err} />
										</li>
									)
								)}
							</ul>
						)}
					</div>
				</div>
			</div>
			<hr className="h-px my-2 bg-gray-200 border-0 dark:bg-gray-300"></hr>
			<div className="flex justify-end">
				<Button
					type="button"
					onClick={onClose}
					variant="outline"
				>
					Cancelar
				</Button>
				<Button
					type="button"
					className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 ml-2"
					form="form-complementary-activity"
					onClick={handleClick}
					disabled={
						JSON.stringify(values) ===
							JSON.stringify(initialValues) && files.length === 0
					}
        >
          <FiSave className="size-4" />
          <span>
            {initialValuesData ? 'Actualizar Actividad' : 'Agregar Actividad'}
          </span>
				</Button>
			</div>
		</>
	);
};
