import { useEffect, useRef, useState } from 'react';
import { useFormik } from 'formik';
import {
	useGetDigitalBlackboard,
	useUpdateDigitalBlackboard,
} from '@api/digital-blackboards';
import { Button, Loading, TagError } from '@shared/components';
import { errorsFormik } from '@shared/utils';
import {
	buildDigitalBlackboardBody,
	digitalBlackboardSchema,
	initialDigitalBlackboardValues,
	TDigitalBlackboardFormValues,
} from '../schemas';
import { DigitalBlackboardFormInputs } from './DigitalBlackboardFormInputs';
import { FiSave } from 'react-icons/fi';

interface EditDigitalBlackboardFormProps {
	digitalBlackboardId: string;
	onCancel: () => void;
	onSuccess: () => void;
}

export const EditDigitalBlackboardForm = ({
	digitalBlackboardId,
	onCancel,
	onSuccess,
}: EditDigitalBlackboardFormProps) => {
	const {
		data: digitalBlackboard,
		isLoading,
		isError,
	} = useGetDigitalBlackboard(digitalBlackboardId);

	const { updateDigitalBlackboard, isPendingUpdate } =
		useUpdateDigitalBlackboard();

	const [initialValues, setInitialValues] =
		useState<TDigitalBlackboardFormValues>(initialDigitalBlackboardValues);
	const hasInitialized = useRef(false);

	useEffect(() => {
		if (!digitalBlackboard || hasInitialized.current) return;

		hasInitialized.current = true;
		setInitialValues({
			description: digitalBlackboard.description ?? '',
			brandId: digitalBlackboard.brandId,
			monitorTypeId: digitalBlackboard.monitorTypeId,
			monitorSizeId: digitalBlackboard.monitorSizeId,
			conditionId: digitalBlackboard.conditionId,
			classroomId: digitalBlackboard.classroom?.id ?? '',
		});
	}, [digitalBlackboard]);

	const formik = useFormik<TDigitalBlackboardFormValues>({
		enableReinitialize: true,
		initialValues,
		onSubmit: async values => {
			try {
				await updateDigitalBlackboard({
					id: digitalBlackboardId,
					body: buildDigitalBlackboardBody(values),
				});
				onSuccess();
			} catch {
				// Manejo de error en la mutation
			}
		},
		validate: values => {
			const result = digitalBlackboardSchema.safeParse(values);
			if (result.success) return;
			return errorsFormik<TDigitalBlackboardFormValues>(result);
		},
	});

	if (isLoading) return <Loading />;
	if (isError || !digitalBlackboard) return <TagError />;

	const classroomDefaultOption = digitalBlackboard.classroom
		? {
				value: digitalBlackboard.classroom.id,
				label: digitalBlackboard.classroom.name,
			}
		: null;

	return (
		<div className="flex flex-col max-h-[calc(90vh-6rem)] min-h-0">
			<h1 className="text-xl font-bold mb-1 shrink-0">
				Editar Pizarra Digital
			</h1>
			<p className="text-sm text-gray-500 mb-3 shrink-0">
				Modificar los detalles de la pizarra digital
			</p>
			<hr className="h-px my-2 bg-gray-200 border-0 shrink-0" />

			<form
				id="edit-digital-blackboard-form"
				onSubmit={formik.handleSubmit}
				className="flex-1 overflow-auto min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4 py-2"
			>
				<DigitalBlackboardFormInputs
					formik={formik}
					disabled={isPendingUpdate}
					classroomDefaultOption={classroomDefaultOption}
				/>
			</form>

			<div className="flex justify-end gap-2 mt-2 shrink-0">
				<Button
					type="button"
					onClick={onCancel}
					disabled={isPendingUpdate}
					variant="outline"
				>
					Cancelar
				</Button>
				<Button
					type="submit"
					form="edit-digital-blackboard-form"
					disabled={isPendingUpdate}
					className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
				>
          {!isPendingUpdate && <FiSave className="size-4" />}
					<span>
						{isPendingUpdate
							? 'Guardando...'
							: 'Actualizar Pizarra Digital'}
					</span>
				</Button>
			</div>
		</div>
	);
};
