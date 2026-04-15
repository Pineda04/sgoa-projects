import { Button } from '@components/ui/button';
import { Error, Loading, ModalBase, SearchAsyncSelect } from '@components';
import { TCenterDepartment } from '@features/centers';
import {
	useChangeTeacherCourseClassroom,
	useDeleteCourseClassroom,
} from '@features/coordinators';
import {
	courseClassroomSchema,
	TUpdateCourseClassroom,
} from '@features/coordinators/schemas';
import {
	TTeacherBasicInfo,
	useGetTeachersBySearchTerm,
} from '@features/shared/users';
import { TCourseClassroom, TAcademicCommonProps } from '@features/teachers';
import { askDel } from '@features/teachers/utils/activities/delete-action';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useModal } from '@hooks';
import { errorsFormik } from '@utils';
import { customOptionsReactSelect } from '@utils/options';
import { useFormik } from 'formik';
import { TrashIcon, UserCog } from 'lucide-react';
import { ResponsiveTable, IResponsiveColumn } from '@components/ui/ResponsiveTable';

const useTeachersSearch = (st: string) => useGetTeachersBySearchTerm(st);

type CourseClassroomData = TCourseClassroom & {
	teacher: {
		id: string;
		userId: string;
		name: string;
		code: string;
	};
	centerDepartment: TCenterDepartment & {
		center: Pick<TAcademicCommonProps, 'name'>;
		department: Pick<TAcademicCommonProps, 'name'>;
		coordinator: Pick<TAcademicCommonProps, 'name'>;
	};
};

export const CourseClassroomsTable = ({
	coursesInfo,
	isWhithActions: whithActions,
}: {
	coursesInfo: CourseClassroomData[];
	isWhithActions?: boolean;
}) => {
	const [
		isShowModalChangeTeacher,
		handleShowModalChangeTeacher,
		handleCloseModalChangeTeacher,
	] = useModal();

	const { deleteCourseClassroom, isPendingDeleteCourseClassroom } =
		useDeleteCourseClassroom();

	const {
		changeTeacherCourseClassroom,
		isPendingChangeTeacherCourseClassroom,
	} = useChangeTeacherCourseClassroom();

	const { values, touched, errors, setValues, handleSubmit } =
		useFormik<TUpdateCourseClassroom>({
			initialValues: {
				teacherName: '',
				teacherId: '',
				courseClassroomId: '',
			},
			onSubmit: async values => {
				await changeTeacherCourseClassroom({
					courseClassroomId: values.courseClassroomId,
					teacherId: values.teacherId,
				});

				handleCloseModalChangeTeacher();
			},
			validateOnChange: true,
			validate: values => {
				const result = courseClassroomSchema.safeParse(values);

				if (result.success) return;

				return errorsFormik<TUpdateCourseClassroom>(result);
			},
		});

	const handleDelete = (id: string) =>
		askDel(id, 'eliminar la asignatura', deleteCourseClassroom);

	const handleSelectChangeTeacher = (
		courseClassroomId: string,
		teacherName: string
	) => {
		setValues({
			...values,
			teacherName,
			courseClassroomId,
		});

		handleShowModalChangeTeacher();
	};

	const handleTeacherInfo = (data: TTeacherBasicInfo) =>
		setValues({
			...values,
			teacherId: data.id,
		});

	if (isPendingDeleteCourseClassroom || isPendingChangeTeacherCourseClassroom)
		return <Loading />;

	const columns: IResponsiveColumn<CourseClassroomData>[] = [
		{
			key: 'teacher.code',
			header: 'No.Empleado',
			mobileLabel: 'Cod.',
			render: (row: CourseClassroomData) => row.teacher.code,
		},
		{
			key: 'teacher.name',
			header: 'Nombre',
			mobileLabel: 'Nombre',
			render: (row: CourseClassroomData) => row.teacher.name,
		},
		{
			key: 'course.code',
			header: 'Codigo',
			mobileLabel: 'Cod. Asig.',
			render: (row: CourseClassroomData) => row.course.code,
		},
		{
			key: 'course.name',
			header: 'Asignatura',
			mobileLabel: 'Asignatura',
			render: (row: CourseClassroomData) => row.course.name,
		},
		{
			key: 'section',
			header: 'Sección',
			mobileLabel: 'Sec.',
			render: (row: CourseClassroomData) => row.section,
		},
		{
			key: 'course.uvs',
			header: 'UV',
			mobileLabel: 'UV',
		},
		{
			key: 'days',
			header: 'Días',
			mobileLabel: 'Días',
			hiddenOnMobile: true,
		},
		{
			key: 'studentCount',
			header: 'No. Alumnos',
			mobileLabel: 'Alum.',
		},
		{
			key: 'classroom.name',
			header: 'No. Aula',
			mobileLabel: 'Aula',
			hiddenOnMobile: true,
		},
		{
			key: 'course.department.name',
			header: 'Carrera',
			mobileLabel: 'Carrera',
			hiddenOnMobile: true,
		},
		{
			key: 'centerDepartment.coordinator.name',
			header: 'Jefe/Coordinador',
			mobileLabel: 'Coord.',
			hiddenOnMobile: true,
		},
		{
			key: 'centerDepartment.center.name',
			header: 'Centro/Telecentro',
			mobileLabel: 'Centro',
			hiddenOnMobile: true,
		},
		{
			key: 'observation',
			header: 'Observación',
			mobileLabel: 'Obs.',
			hiddenOnMobile: true,
		},
	];

	if (whithActions) {
		columns.push({
			key: 'actions',
			header: 'Acciones',
			mobileLabel: 'Acciones',
			render: (row: CourseClassroomData) => (
				<div className="flex gap-2 justify-center">
					<Button
						onClick={() =>
							handleSelectChangeTeacher(
								row.id,
								row.teacher.name
							)
						}
						className="p-1.5 bg-blue-500 text-white hover:bg-blue-600 transition duration-200"
						title="Cambiar docente"
						variant="unstyled"
					>
						<UserCog className="h-3.5 w-3.5" />
					</Button>

					<Button
						onClick={() => handleDelete(row.id)}
						className="p-1.5 bg-red-500 text-white hover:bg-red-600 transition duration-200"
						title="Eliminar"
						variant="unstyled"
					>
						<TrashIcon className="h-3.5 w-3.5" />
					</Button>
				</div>
			),
		});
	}

	return (
		<>
			<div className="py-5 px-5">
				<ResponsiveTable<CourseClassroomData>
					columns={columns}
					data={coursesInfo}
					getRowKey={cc => cc.id}
					className="w-full"
				/>
			</div>

			<ModalBase
				isOpen={isShowModalChangeTeacher}
				onClose={handleCloseModalChangeTeacher}
			>
				<div className="text-start">
					<h1 className="flex text-xl font-bold mb-5">
						Cambiar docente
					</h1>
					<hr className="h-px my-2 bg-gray-200 border-0" />
					<form
						className="flex flex-col md:flex-row gap-4 mt-3 items-center"
						id="change-teacher"
						onSubmit={handleSubmit}
					>
						<div className="w-full">
							<input
								id="teacherName"
								name="teacherName"
								className="w-full p-2 rounded-md border border-gray-300"
								value={values.teacherName}
								disabled
							/>
						</div>

						<div className="flex justify-center items-center">
							<ArrowPathIcon className="h-6 w-6" />
						</div>

						<div className="w-full">
							<SearchAsyncSelect<TTeacherBasicInfo>
								hook={useTeachersSearch}
								handleChange={handleTeacherInfo}
								getOptionValue={t => t.id}
								getOptionLabel={t => t.code}
								formatOptionLabel={(data, { context }) => {
									return customOptionsReactSelect(
										data.label,
										data.data.name,
										context
									);
								}}
							/>
							{touched.teacherId && errors.teacherId && (
								<Error error={errors.teacherId} />
							)}
						</div>
					</form>
					<div className="md:col-span-2 flex justify-end mt-3">
						<Button
							type="submit"
							form="change-teacher"
							className="w-[200px] justify-center bg-[#5BC85C] text-white p-2 hover:bg-green-300 transition flex flex-row gap-2 duration-500 cursor-pointer mr-2"
							disabled={!errors}
							variant="unstyled"
						>
							Realizar el cambio
						</Button>
						<Button
							type="button"
							className="w-[100px] justify-center bg-[#fc4c3f] text-white p-2 hover:bg-red-300 transition flex flex-row gap-2 duration-500 cursor-pointer"
							onClick={handleCloseModalChangeTeacher}
							variant="unstyled"
						>
							Cancelar
						</Button>
					</div>
				</div>
			</ModalBase>
		</>
	);
};
