import { useState } from 'react';
import {
	ArrowPathIcon,
	PencilSquareIcon,
	TrashIcon,
} from '@heroicons/react/24/outline';
import { useFormik } from 'formik';
import { UserCog } from 'lucide-react';
import { TTeacherBasicInfo, useGetTeachersBySearchTerm } from '@api/teachers';
import { TCenterDepartment } from '@api/centers';
import { TAcademicCommonProps } from '@api/periods';
import { useModal } from '@shared/hooks';
import { courseClassroomSchema } from '../schemas';
import { customOptionsReactSelect, errorsFormik } from '@shared/utils';
import {
	TCourseClassroom,
	TUpdateCourseClassroom,
	useChangeTeacherCourseClassroom,
	useDeleteCourseClassroom,
} from '@api/courses';
import {
	Button,
	Error,
	IResponsiveColumn,
	ModalBase,
	ResponsiveTable,
	SearchAsyncSelect,
} from '@shared/components';
import { DeleteCourseClassroomModal } from './DeleteCourseClassroomModal';
import { EditCourseClassroomForm } from './EditCourseClassroomForm';
import { FiSave } from 'react-icons/fi';

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

	const [isShowModalEdit, handleShowModalEdit, handleCloseModalEdit] =
		useModal();
	const [editingCourseClassroomId, setEditingCourseClassroomId] = useState<
		string | null
	>(null);

	const [isShowModalDelete, handleShowModalDelete, handleCloseModalDelete] =
		useModal();
	const [courseClassroomToDelete, setCourseClassroomToDelete] = useState<
		CourseClassroomData | undefined
	>();

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

	const handleOpenDelete = (row: CourseClassroomData) => {
		setCourseClassroomToDelete(row);
		handleShowModalDelete();
	};

	const handleCloseDelete = () => {
		setCourseClassroomToDelete(undefined);
		handleCloseModalDelete();
	};

	const handleConfirmDelete = async () => {
		if (!courseClassroomToDelete) return;

		await deleteCourseClassroom(courseClassroomToDelete.id);
		handleCloseDelete();
	};

	const handleEdit = (id: string) => {
		setEditingCourseClassroomId(id);
		handleShowModalEdit();
	};

	const handleEditSuccess = () => {
		setEditingCourseClassroomId(null);
		handleCloseModalEdit();
	};

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
			render: (row: CourseClassroomData) =>
				row.studentCount ?? 'Sin información',
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
			className:
				'max-w-[50ch] whitespace-normal break-words text-left align-top',
		},
	];

	if (whithActions) {
		columns.push({
			key: 'actions',
			header: 'Acciones',
			mobileLabel: 'Acciones',
			sticky: 'right',
			render: (row: CourseClassroomData) => (
				<div className="flex items-center justify-center gap-3">
					<button
						onClick={() =>
							handleSelectChangeTeacher(row.id, row.teacher.name)
						}
						className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
						title="Cambiar docente"
					>
						<UserCog className="size-5" />
					</button>

					<button
						onClick={() => handleEdit(row.id)}
						className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-full transition-colors cursor-pointer"
						title="Editar"
					>
						<PencilSquareIcon className="size-5" />
					</button>

					<button
						onClick={() => handleOpenDelete(row)}
						className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
						title="Eliminar"
					>
						<TrashIcon className="size-5" />
					</button>
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
								getOptionLabel={t => t.name}
								formatOptionLabel={(data, { context }) => {
									return customOptionsReactSelect(
										data.label,
										data.data.code,
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
							type="button"
							onClick={handleCloseModalChangeTeacher}
							disabled={isPendingChangeTeacherCourseClassroom}
							variant="outline"
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							form="change-teacher"
							className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 ml-2"
							disabled={isPendingChangeTeacherCourseClassroom}
						>
							{!isPendingChangeTeacherCourseClassroom && (
								<FiSave className="size-4" />
							)}
							<span>
								{isPendingChangeTeacherCourseClassroom
									? 'Guardando...'
									: 'Actualizar Docente'}
							</span>
						</Button>
					</div>
				</div>
			</ModalBase>

			<ModalBase
				isOpen={isShowModalEdit}
				onClose={() => {
					setEditingCourseClassroomId(null);
					handleCloseModalEdit();
				}}
			>
				{editingCourseClassroomId && (
					<EditCourseClassroomForm
						courseClassroomId={editingCourseClassroomId}
						onCancel={() => {
							setEditingCourseClassroomId(null);
							handleCloseModalEdit();
						}}
						onSuccess={handleEditSuccess}
					/>
				)}
			</ModalBase>

			<DeleteCourseClassroomModal
				isOpen={isShowModalDelete}
				onClose={handleCloseDelete}
				onConfirm={handleConfirmDelete}
				courseLabel={
					courseClassroomToDelete
						? `${courseClassroomToDelete.course.code} - ${courseClassroomToDelete.course.name}`
						: undefined
				}
				isPending={isPendingDeleteCourseClassroom}
			/>
		</>
	);
};
