import { useCallback, useState } from 'react';
import { PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Button, DataTable, IDataTableColumn, useModal } from '@shared';
import { TAcademicCommonProps } from '@api/periods';
import { useDeleteUndergrad, useDeletePostgrad } from '@api/degrees';
import { DegreeFormModal } from './DegreeFormModal';
import { DegreeDeleteModal } from './DegreeDeleteModal';

type DegreeType = 'undergrad' | 'postgrad';

interface DegreeTableProps {
    degreeType: DegreeType;
    data: TAcademicCommonProps[];
    isLoading: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
}

const LABELS: Record<DegreeType, { singular: string; emptyMsg: string }> = {
    undergrad: { singular: 'pregrado', emptyMsg: 'No hay pregrados registrados' },
    postgrad:  { singular: 'posgrado', emptyMsg: 'No hay posgrados registrados' },
};

export const DegreeTable = ({
    degreeType,
    data,
    isLoading,
    canCreate,
    canUpdate,
    canDelete,
}: DegreeTableProps) => {
    const label = LABELS[degreeType];

    const [isFormOpen, openForm, closeForm] = useModal();
    const [isDeleteOpen, openDelete, closeDelete] = useModal();
    const [selectedDegree, setSelectedDegree] = useState<TAcademicCommonProps | undefined>();

    const { deleteUndergrad, isPendingDelete: isPendingDeleteUndergrad } = useDeleteUndergrad(selectedDegree?.id ?? '');
    const { deletePostgrad, isPendingDelete: isPendingDeletePostgrad } = useDeletePostgrad(selectedDegree?.id ?? '');
    const isPendingDelete = isPendingDeleteUndergrad || isPendingDeletePostgrad;

    const handleOpenCreate = () => {
        setSelectedDegree(undefined);
        openForm();
    };

    const handleOpenEdit = useCallback((degree: TAcademicCommonProps) => {
        setSelectedDegree(degree);
        openForm();
    }, [openForm]);

    const handleOpenDelete = useCallback((degree: TAcademicCommonProps) => {
        setSelectedDegree(degree);
        openDelete();
    }, [openDelete]);

    const handleCloseForm = () => {
        closeForm();
        setSelectedDegree(undefined);
    };

    const handleCloseDelete = () => {
        closeDelete();
        setSelectedDegree(undefined);
    };

    const handleConfirmDelete = async () => {
        if (!selectedDegree) return;
        if (degreeType === 'undergrad') {
            await deleteUndergrad(selectedDegree.id);
        } else {
            await deletePostgrad(selectedDegree.id);
        }
        handleCloseDelete();
    };

    const hasActions = canUpdate || canDelete;

    const columns: IDataTableColumn<TAcademicCommonProps>[] = [
        {
            key: 'name',
            header: 'Nombre',
            mobileLabel: 'Nombre',
        },
        ...(hasActions ? [{
            key: 'actions',
            header: 'Acciones',
            mobileLabel: 'Acciones',
            render: (row: TAcademicCommonProps) => (
                <div className="flex items-center justify-center gap-3">
                    {canUpdate && (
                        <button
                            onClick={() => handleOpenEdit(row)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                            title={`Editar ${label.singular}`}
                        >
                            <PencilSquareIcon className="size-5" />
                        </button>
                    )}
                    {canDelete && (
                        <button
                            onClick={() => handleOpenDelete(row)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                            title={`Eliminar ${label.singular}`}
                        >
                            <TrashIcon className="size-5" />
                        </button>
                    )}
                </div>
            ),
        }] as IDataTableColumn<TAcademicCommonProps>[] : []),
    ];

    return (
        <>
            <div className="flex justify-center mb-4">
                {canCreate && (
                    <Button
                        type="button"
                        className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 px-4 py-2 rounded-md font-medium shadow-xs transition-all duration-300 hover:shadow-md active:scale-95 group"
                        onClick={handleOpenCreate}
                    >
                        <PlusIcon className="size-5 transition-transform duration-300 group-hover:rotate-90" />
                        <span>Nuevo {label.singular}</span>
                    </Button>
                )}
            </div>

            <DataTable<TAcademicCommonProps>
                columns={columns}
                data={data}
                getRowKey={row => row.id}
                loading={isLoading}
                emptyMessage={label.emptyMsg}
                showRowNumber={false}
            />

            <DegreeFormModal
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                degreeType={degreeType}
                degree={selectedDegree}
            />

            <DegreeDeleteModal
                isOpen={isDeleteOpen}
                onClose={handleCloseDelete}
                onConfirm={handleConfirmDelete}
                degreeType={degreeType}
                degreeName={selectedDegree?.name}
                isPending={isPendingDelete}
            />
        </>
    );
};
