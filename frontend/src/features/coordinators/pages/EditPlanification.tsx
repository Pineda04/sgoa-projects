import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@components/ui/button';
import { ModalBase } from '@components';
import {
PlusCircleIcon,
XCircleIcon,
PencilIcon,
DocumentCheckIcon,
} from '@heroicons/react/24/outline';
import { PlanificationForm } from '../components/PlanificationForm';
import { TPlanification } from '../schemas/planification.schemas';
import { useModal } from '@hooks';

export const EditPlanification = () => {
const { centerDepartmentId } = useParams();
const [rows, setRows] = useState<TPlanification[]>([]);
const [editingIndex, setEditingIndex] = useState<number | null>(null);
const [isOpenFormModal, handleShowFormModal, handleCloseFormModal] = useModal();

const openAdd = () => {
    setEditingIndex(null);
    handleShowFormModal();
};

const openEdit = (index: number) => {
setEditingIndex(index);
handleShowFormModal();
};

const handleDelete = (index: number) => {
setRows(rows.filter((_, rowIndex) => rowIndex !== index));
};

const handleSave = (row: TPlanification) => {
if (editingIndex !== null) {
setRows(rows.map((item, index) => (index === editingIndex ? row : item)));
} else {
setRows([...rows, row]);
}
handleCloseFormModal();
};

const handleSubmitPlanification = () => {
console.log('Datos guardados:', rows);
};

return (
<>
<div className="mt-10 flex flex-col items-center">
<label className="text-2xl font-semibold">UNAH CAMPUS-COPÁN</label>
<label>Asignación Académica Presencial</label>
</div>

<div className="mb-6 mt-6 flex flex-wrap justify-center gap-4 px-5">
<Button
onClick={openAdd}
className="flex items-center justify-center gap-2 bg-[#5BC85C] text-white px-4 py-2 hover:bg-green-300 transition duration-300 cursor-pointer"
variant="unstyled"
size="default"
>
<PlusCircleIcon className="h-5 w-5" />
Agregar fila
</Button>
<Button
onClick={handleSubmitPlanification}
className="flex items-center justify-center gap-2 bg-[#C40C54] text-white px-4 py-2 hover:bg-pink-500 transition duration-300 cursor-pointer"
variant="unstyled"
size="default"
>
<DocumentCheckIcon className="h-5 w-5" />
Guardar planificación
</Button>
</div>

<div className="w-full overflow-x-auto py-2 text-sm px-5">
<div className="overflow-hidden rounded-md shadow-md overflow-x-auto mx-auto">
<table className="w-full min-w-[1200px]">
<thead className="bg-[#144C74] text-white">
<tr>
<th className="py-2 px-4">#</th>
<th className="py-2 px-4">No. Empleado</th>
<th className="py-2 px-4">Nombre</th>
<th className="py-2 px-4">Código</th>
<th className="py-2 px-4">Asignatura</th>
<th className="py-2 px-4">Sección</th>
<th className="py-2 px-4">UV</th>
<th className="py-2 px-4">Días</th>
<th className="py-2 px-4">No. Alumnos</th>
<th className="py-2 px-4">N° de Aula</th>
<th className="py-2 px-4">Carrera/Área</th>
<th className="py-2 px-4">Jefe/Coordinador</th>
<th className="py-2 px-4">Centro</th>
<th className="py-2 px-4">Est. por egresar</th>
<th className="py-2 px-4">Observaciones</th>
<th className="py-2 px-4">Acciones</th>
</tr>
</thead>
<tbody className="[&>tr:nth-child(odd)]:bg-white [&>tr:nth-child(even)]:bg-gray-100 text-center">
{rows.length === 0 ? (
<tr>
<td colSpan={15} className="py-6 text-gray-500">
Sin registros. Presiona "Agregar fila" para crear.
</td>
</tr>
) : (
rows.map((row, index) => (
<tr key={index}>
<td className="py-2 px-2 border">{index + 1}</td>
<td className="py-2 px-2 border">{row.teacherCode}</td>
<td className="py-2 px-2 border">{row.teacherName}</td>
<td className="py-2 px-2 border">{row.courseCode}</td>
<td className="py-2 px-2 border">{row.courseName}</td>
<td className="py-2 px-2 border">{row.section}</td>
<td className="py-2 px-2 border">{row.uv}</td>
<td className="py-2 px-2 border">{row.days}</td>
<td className="py-2 px-2 border">{row.studentCount}</td>
<td className="py-2 px-2 border">{row.classroomName}</td>
<td className="py-2 px-2 border">{row.departmentName}</td>
<td className="py-2 px-2 border">{row.coordinator}</td>
<td className="py-2 px-2 border">{row.center}</td>
<td className="py-2 px-2 border">{row.nearGraduation ? 'Sí' : 'No'}</td>
<td className="py-2 px-2 border">{row.observation}</td>
<td className="py-2 px-2 border">
<div className="flex flex-wrap justify-center gap-2">
<Button
variant="unstyled"
onClick={() => openEdit(index)}
className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
>
<PencilIcon className="h-4 w-4" />
Editar
</Button>
<Button
variant="unstyled"
onClick={() => handleDelete(index)}
className="flex items-center gap-2 text-red-600 hover:text-red-800"
>
<XCircleIcon className="h-4 w-4" />
Eliminar
</Button>
</div>
</td>
</tr>
))
)}
</tbody>
</table>
</div>
</div>

<ModalBase isOpen={isOpenFormModal} onClose={handleCloseFormModal}>
<PlanificationForm
key={editingIndex ?? 'new'}
centerDepartmentId={centerDepartmentId ?? ''}
initialData={editingIndex !== null ? rows[editingIndex] : undefined}
onCancel={handleCloseFormModal}
onSubmit={handleSave}
/>
</ModalBase>
</>
);
};
