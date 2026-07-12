import { useMemo } from 'react';
import { useFormik } from 'formik';
import { useNavigate, useParams } from 'react-router-dom';
import {
	useGetClassroomById,
	useUpdateClassroomMutation,
} from '@api/classrooms';
import { Button, Loading, TagError } from '@shared/components';
import { errorsFormik } from '@shared/utils';
import {
	buildClassroomBody,
	classroomSchema,
	initialClassroomValues,
	TClassroomFormValues,
} from '../schemas';
import { ClassroomFormInputs } from '../components';

export const EditClassroom = () => {
	const { id = '' } = useParams();
	const navigate = useNavigate();

	const { data: classroom, isLoading, isError } = useGetClassroomById(id);
	const { updateClassroom, isPendingUpdate } = useUpdateClassroomMutation();

	const initialValues = useMemo<TClassroomFormValues>(() => {
		if (!classroom) return initialClassroomValues;

		return {
			name: classroom.name,
			desks: String(classroom.desks),
			tables: String(classroom.tables),
			projectors: String(classroom.projectors),
			powerOutlets: String(classroom.powerOutlets),
			lights: String(classroom.lights),
			blackboards: String(classroom.blackboards),
			lecterns: String(classroom.lecterns),
			windows: String(classroom.windows),
			maxCapacity:
				classroom.maxCapacity != null
					? String(classroom.maxCapacity)
					: '',
			activeStatus: classroom.activeStatus ?? true,
			buildingId: classroom.buildingId,
			roomTypeId: classroom.roomTypeId,
			connectivityId: classroom.connectivityId ?? '',
			audioEquipmentId: classroom.audioEquipmentId ?? '',
			conditionId: classroom.conditionId ?? '',
			digitalBlackboardId: classroom.digitalBlackboardId ?? '',
		};
	}, [classroom]);

	const formik = useFormik<TClassroomFormValues>({
		enableReinitialize: true,
		initialValues,
		onSubmit: async values => {
			try {
				await updateClassroom({
					id,
					body: buildClassroomBody(values),
				});
				navigate('/infrastructure/classrooms');
			} catch {
				// Error handling done en la mutation
			}
		},
		validate: values => {
			const result = classroomSchema.safeParse(values);
			if (result.success) return;
			return errorsFormik<TClassroomFormValues>(result);
		},
	});

	if (isLoading) return <Loading />;
	if (isError || !classroom) return <TagError />;

	return (
		<div className="p-10 rounded shadow-md w-full max-w-4xl h-fit bg-white m-auto mb-8">
			<h1 className="text-2xl font-bold text-foreground">Editar Aula</h1>
			<p className="text-muted-foreground mt-1 mb-6">{classroom.name}</p>

			<form
				onSubmit={formik.handleSubmit}
				className="grid grid-cols-1 md:grid-cols-2 gap-4"
			>
				<ClassroomFormInputs
					formik={formik}
					disabled={isPendingUpdate}
				/>

				<div className="flex justify-end gap-2 mt-4 md:col-span-2">
					<Button
						type="submit"
						disabled={isPendingUpdate}
						className="w-30 justify-center bg-[#5BC85C] text-white p-2 hover:bg-green-300 transition duration-300 cursor-pointer"
						variant="unstyled"
					>
						{isPendingUpdate ? 'Guardando...' : 'Actualizar'}
					</Button>
					<Button
						type="button"
						onClick={() => navigate(-1)}
						disabled={isPendingUpdate}
						className="w-25 justify-center bg-[#fc4c3f] text-white p-2 hover:bg-red-300 transition duration-300 cursor-pointer"
						variant="unstyled"
					>
						Cancelar
					</Button>
				</div>
			</form>
		</div>
	);
};
