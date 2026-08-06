import { useFormik } from 'formik';
import { useState } from 'react';
import {
	PencilIcon,
	CheckCircleIcon,
	XCircleIcon,
} from '@heroicons/react/24/outline';
import { TCourseClassroom, TCourseStadistic, TCourseStadisticOmit, useUpdateCourseStadistic } from '@api/courses';
import { courseStadisticSchema } from '../schemas/course-stadistic.schema';
import { errorsFormik } from '@shared/utils';
import { Button } from '@shared/components';

export const CourseStadisticEdit = ({
	reportId,
	infoCourseClassroom,
	mode,
}: {
	reportId: string;
	infoCourseClassroom: TCourseClassroom & {
		courseStadistic: TCourseStadistic | null;
	};
	mode: 'view' | 'edit';
}) => {
	const courseStadistic = infoCourseClassroom.courseStadistic;
	const { updateCourseStadistic } = useUpdateCourseStadistic(reportId);
	const [isInputsActive, setIsInputsActive] = useState<boolean>(false);

	const {
		values,
		touched,
		errors,
		handleChange,
		handleBlur,
		resetForm,
		submitForm,
	} =
		useFormik<TCourseStadisticOmit>({
			initialValues: {
				APB: courseStadistic?.APB ?? 0,
				NSP: courseStadistic?.NSP ?? 0,
				RPB: courseStadistic?.RPB ?? 0,
				ABD: courseStadistic?.ABD ?? 0,
			},
			onSubmit: values => onSubmitting(values),
			validateOnChange: true,
			validate: values => {
				const result = courseStadisticSchema.safeParse(values);

				if (result.success) return;

				return errorsFormik<TCourseStadisticOmit>(result);
			},
		});

	const [showSumError, setShowSumError] = useState(false);
	const onSubmitting = async (values: TCourseStadisticOmit) => {
		if (!courseStadistic) return;

		const total = values.APB + values.RPB + values.NSP + values.ABD;
		if (
			infoCourseClassroom.studentCount !== null &&
			total !== infoCourseClassroom.studentCount
		) {
			setShowSumError(true);
			setTimeout(() => setShowSumError(false), 5000);
			return;
		}

		await updateCourseStadistic({
			courseClassroomId: courseStadistic.courseClassroomId,
			body: values,
		});

		setIsInputsActive(false);
	};

	return (
		<>
			<tr key={infoCourseClassroom.id}>
				<td className="py-fit border">
					{infoCourseClassroom.course.code}
				</td>
				<td className="py-fit border">
					{infoCourseClassroom.course.name}
				</td>
				<td className="py-fit border">{infoCourseClassroom.section}</td>
				<td className="py-fit border">
					{infoCourseClassroom.course.uvs}
				</td>
				{/*Datos que el usuario va a ingresar*/}
				<td
					className={`py-fit border ${
						touched.APB && errors.APB ? 'bg-red-200' : ''
					}`}
				>
					{courseStadistic ? (
						<input
							type="number"
							name="APB"
							className="w-12 ps-3 text-center"
							value={values.APB}
							disabled={!isInputsActive}
							onChange={handleChange}
							onBlur={handleBlur}
						/>
					) : (
						<span>Sin información</span>
					)}
				</td>
				<td
					className={`py-fit border ${
						touched.RPB && errors.RPB ? 'bg-red-200' : ''
					}`}
				>
					{courseStadistic ? (
						<input
							type="number"
							name="RPB"
							className="w-12 ps-3 text-center"
							value={values.RPB}
							disabled={!isInputsActive}
							onChange={handleChange}
							onBlur={handleBlur}
						/>
					) : (
						<span>Sin información</span>
					)}
				</td>
				<td
					className={`py-fit border ${
						touched.NSP && errors.NSP ? 'bg-red-200' : ''
					}`}
				>
					{courseStadistic ? (
						<input
							type="number"
							name="NSP"
							className="w-12 ps-3 text-center"
							value={values.NSP}
							disabled={!isInputsActive}
							onChange={handleChange}
							onBlur={handleBlur}
						/>
					) : (
						<span>Sin información</span>
					)}
				</td>
				<td
					className={`py-fit border ${
						touched.ABD && errors.ABD ? 'bg-red-200' : ''
					}`}
				>
					{courseStadistic ? (
						<input
							type="number"
							name="ABD"
							className="w-12 ps-3 text-center"
							value={values.ABD}
							disabled={!isInputsActive}
							onChange={handleChange}
							onBlur={handleBlur}
						/>
					) : (
						<span>Sin información</span>
					)}
				</td>
				<td className="py-fit border">
					{infoCourseClassroom.studentCount ?? 'Sin información'}
				</td>
				{mode === 'edit' && (
					<td className="py-fit border">
						{!courseStadistic ? (
							<span>Sin información</span>
						) : isInputsActive ? (
							<div className="flex gap-2 justify-center">
				<Button
					type="button"
					className="cursor-pointer"
					onClick={submitForm}
					variant="unstyled"
								>
									<CheckCircleIcon className="my-1 size-6 text-[#144C74] hover:text-[#5BC85C] transition duration-250" />
								</Button>
								<Button
									type="button"
									className="cursor-pointer"
									onClick={() => {
										resetForm({
											values: {
													APB: courseStadistic.APB,
													RPB: courseStadistic.RPB,
													NSP: courseStadistic.NSP,
													ABD: courseStadistic.ABD,
											},
										});
										setIsInputsActive(false);
									}} variant="unstyled"
								>
									<XCircleIcon className="my-1 size-6 text-[#144C74] hover:text-[#DC3545] transition duration-250"></XCircleIcon>
								</Button>
							</div>
						) : (
							<Button
								type="button"
								className="cursor-pointer"
								onClick={() => setIsInputsActive(true)} variant="unstyled"
							>
								<PencilIcon className="mt-1 size-6 text-[#144C74] hover:text-[#FCC40C] transition duration-250" />
							</Button>
						)}
					</td>
				)}
			</tr>
			{/*Fila de advertencia*/}
			<tr>
				<td className="py-fit border" colSpan={10}>
					{(errors.APB || errors.RPB || errors.NSP || errors.ABD) && (
						<label className="text-sm text-[#DC3545] block">
							*El número de estudiantes no puede ser menor que
							"0".
						</label>
					)}
					{showSumError && infoCourseClassroom.studentCount !== null && (
						<label className="text-sm text-[#DC3545] block">
							*La suma de los campos 'APB, RPB, NSP, ABD' debe ser
							igual a {infoCourseClassroom.studentCount}.
						</label>
					)}
				</td>
			</tr>
		</>
	);
};
