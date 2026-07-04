import { useGetClassroomById } from '@api/classrooms';
import { useGetAllDepartments } from '@api/departments';
import { TPcEquipment } from '@api/pc-equipments';
import { Button, ModalBase } from '@shared/components';

interface ViewPcEquipmentModalProps {
	isOpen: boolean;
	onClose: () => void;
	pcEquipment: TPcEquipment;
	brandName?: string;
	conditionName?: string;
	pcTypeName?: string;
	monitorTypeName?: string;
	monitorSizeName?: string;
}

const DetailField = ({
	label,
	value,
}: {
	label: string;
	value?: string | null;
}) => (
	<div className="space-y-1">
		<p className="text-sm font-medium text-foreground">{label}</p>
		<p className="text-sm text-gray-800">{value || '—'}</p>
	</div>
);

export const ViewPcEquipmentModal = ({
	isOpen,
	onClose,
	pcEquipment,
	brandName,
	conditionName,
	pcTypeName,
	monitorTypeName,
	monitorSizeName,
}: ViewPcEquipmentModalProps) => {
	const classroomQuery = useGetClassroomById(pcEquipment.classroomId ?? '');
	const departmentsQuery = useGetAllDepartments();

	const departmentName = departmentsQuery.data?.find(
		d => d.id === pcEquipment.departmentId
	)?.name;

	const classroomValue = !pcEquipment.classroomId
		? 'Sin aula asignada'
		: classroomQuery.isLoading
			? 'Cargando...'
			: classroomQuery.isError
				? 'Error al cargar el aula'
				: classroomQuery.data?.name;

	const departmentValue = !pcEquipment.departmentId
		? 'Sin departamento asignado'
		: departmentsQuery.isLoading
			? 'Cargando...'
			: departmentsQuery.isError
				? 'Error al cargar el departamento'
				: departmentName;

	return (
		<ModalBase isOpen={isOpen} onClose={onClose}>
			<div className="p-2">
				<h1 className="text-xl font-bold mb-1">Detalle del Equipo</h1>
				<p className="text-sm text-gray-500 mb-3">
					{pcEquipment.inventoryNumber}
				</p>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<DetailField
						label="Número de inventario"
						value={pcEquipment.inventoryNumber}
					/>
					<DetailField label="Marca" value={brandName} />
					<DetailField label="Tipo de PC" value={pcTypeName} />
					<DetailField
						label="Procesador"
						value={pcEquipment.processor}
					/>
					<DetailField label="Memoria RAM" value={pcEquipment.ram} />
					<DetailField label="Disco" value={pcEquipment.disk} />
					<DetailField
						label="Tipo de monitor"
						value={monitorTypeName}
					/>
					<DetailField
						label="Tamaño de monitor"
						value={monitorSizeName}
					/>
					<DetailField label="Condición" value={conditionName} />
					<DetailField label="Aula" value={classroomValue} />
					<DetailField
						label="Departamento"
						value={departmentValue}
					/>
				</div>

				<div className="flex justify-end pt-4 mt-4 border-t border-gray-100">
					<Button type="button" variant="outline" onClick={onClose}>
						Cerrar
					</Button>
				</div>
			</div>
		</ModalBase>
	);
};
