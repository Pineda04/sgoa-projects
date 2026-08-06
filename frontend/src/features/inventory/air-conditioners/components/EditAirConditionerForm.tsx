import { useEffect, useRef, useState } from 'react';
import { useFormik } from 'formik';
import {
	useGetAirConditioner,
	useUpdateAirConditioner,
} from '@api/air-conditioners';
import { Button, Loading, TagError } from '@shared/components';
import { errorsFormik } from '@shared/utils';
import {
	airConditionerSchema,
	buildAirConditionerBody,
	initialAirConditionerValues,
	TAirConditionerFormValues,
} from '../schemas';
import { AirConditionerFormInputs } from './AirConditionerFormInputs';
import { FiSave } from 'react-icons/fi';

interface EditAirConditionerFormProps {
	airConditionerId: string;
	onCancel: () => void;
	onSuccess: () => void;
}

export const EditAirConditionerForm = ({
	airConditionerId,
	onCancel,
	onSuccess,
}: EditAirConditionerFormProps) => {
	const {
		data: airConditioner,
		isLoading,
		isError,
	} = useGetAirConditioner(airConditionerId);

	const { updateAirConditioner, isPendingUpdate } = useUpdateAirConditioner();

	const [initialValues, setInitialValues] =
		useState<TAirConditionerFormValues>(initialAirConditionerValues);
	const hasInitialized = useRef(false);

	useEffect(() => {
		if (!airConditioner || hasInitialized.current) return;

		hasInitialized.current = true;
		setInitialValues({
			description: airConditioner.description ?? '',
			brandId: airConditioner.brand?.id ?? '',
			conditionId: airConditioner.condition?.id ?? '',
			classroomId: airConditioner.classroom?.id ?? '',
		});
	}, [airConditioner]);

	const formik = useFormik<TAirConditionerFormValues>({
		enableReinitialize: true,
		initialValues,
		onSubmit: async values => {
			try {
				await updateAirConditioner({
					id: airConditionerId,
					body: buildAirConditionerBody(values),
				});
				onSuccess();
			} catch {
				// Manejo de error en la mutation
			}
		},
		validate: values => {
			const result = airConditionerSchema.safeParse(values);
			if (result.success) return;
			return errorsFormik<TAirConditionerFormValues>(result);
		},
	});

	if (isLoading) return <Loading />;
	if (isError || !airConditioner) return <TagError />;

	const classroomDefaultOption = airConditioner.classroom
		? {
				value: airConditioner.classroom.id,
				label: airConditioner.classroom.name,
			}
		: null;

	return (
		<div className="flex flex-col max-h-[calc(90vh-6rem)] min-h-0">
			<h1 className="text-xl font-bold mb-1 shrink-0">
				Editar Aire Acondicionado
			</h1>
			<p className="text-sm text-gray-500 mb-3 shrink-0">
				{airConditioner.description ?? 'Sin descripción'}
			</p>
			<hr className="h-px my-2 bg-gray-200 border-0 shrink-0" />

			<form
				id="edit-air-conditioner-form"
				onSubmit={formik.handleSubmit}
				className="flex-1 overflow-auto min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4 py-2"
			>
				<AirConditionerFormInputs
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
					form="edit-air-conditioner-form"
					disabled={isPendingUpdate}
					className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
				>
					{!isPendingUpdate && <FiSave className="size-4" />}
					<span>
						{isPendingUpdate
							? 'Guardando...'
							: 'Actualizar Aire Acondicionado'}
					</span>
				</Button>
			</div>
		</div>
	);
};
