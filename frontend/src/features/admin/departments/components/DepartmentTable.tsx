import type { IResponse } from "@shared/interfaces";
import { DataTable, IDataTableColumn, ModalBase, Button } from "@shared/components";
import { TOutputDepartment } from "@api/departments";
import { useModal } from '@shared/hooks';
import { EyeIcon, Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { DepartmentView } from "./DepartmentView";
import { useAbility } from "@config";

interface DepartmentTableProps {
    isLoading: boolean;
    isError: boolean;
    data: IResponse<TOutputDepartment[]> | null
    onNavigateToCreate?: () => void;
}

export const DepartmentTable = ({
    isLoading,
    data,
    onNavigateToCreate
}: DepartmentTableProps) => {

    const ability = useAbility();
    const canCreate = ability.can('create', 'departments');

    const [
        showModalUpdateDeparment,
        handleShowModalUpdateDeparment,
        handleCloseModalUpdateDeparment
    ] = useModal();

    const [departmentInfo, setDepartmentInfo] = useState<TOutputDepartment>();

    const handleSelectedDepartment = useCallback(
        (data: TOutputDepartment) => {
            setDepartmentInfo(data);
            handleShowModalUpdateDeparment();
        },
        [handleShowModalUpdateDeparment]
    );

    const updateDepartmentInfo = useMemo(() => {
        if (departmentInfo && data) {
            //TODO: revisar si esta bien
            const department = data.data.find(d => d.id === departmentInfo.id)
            return department || departmentInfo
        }
        return departmentInfo
    }, [data, departmentInfo])

    //key debe coincidir con nombre de la prop a la que se quiere acceder
    const columns: IDataTableColumn<TOutputDepartment>[] = [
        { key: 'name', header: 'Nombre', mobileLabel: 'Nombre' },
        {
            key: 'uvs',
            header: 'Unidades Valorativas',
            mobileLabel: 'UVs',
            render: (row: TOutputDepartment) => row.uvs !== null ? row.uvs : 'Sin UV'
        },
        { key: 'facultyName', header: 'Facultad', mobileLabel: 'Facultad' },
        {
            key: 'actions',
            header: 'Acciones',
            mobileLabel: 'Acciones',
            render: (row: TOutputDepartment) => (
                <Button
                    aria-label={`Ver detalle del departamento ${row.name}`}
                    title={`Ver detalle del departamento ${row.name}`}
                    onClick={() => handleSelectedDepartment(row)}
                    className="cursor-pointer"
                    variant="unstyled"
                >
                    <EyeIcon className="size-5 text-[#1C64B4] hover:text-[#144C74]" />
                </Button>
            )
        },
    ]

    return (
        <>
            <div className="mt-5">
                {canCreate && (
                    <div className="flex justify-center mb-5">
                        <Button
                            type='button'
                            className="w-fit justify-start bg-[#5BC85C] text-white p-2 hover:bg-green-300 transition flex flex-row duration-500"
                            onClick={onNavigateToCreate}
                            variant="unstyled"
                        >
                            <Plus className="size-6" />
                            Nuevo departamento
                        </Button>
                    </div>
                )}
                <DataTable
                    columns={columns}
                    data={data?.data ?? []}
                    getRowKey={row => row.id}
                    loading={isLoading}
                    emptyMessage="No hay departamentos registrados"
                    showRowNumber={false}
                />
                {/* Paginacion no se coloca porque no viene del backend */}
            </div>
            {
                updateDepartmentInfo && (
                    <ModalBase
                        isOpen={showModalUpdateDeparment}
                        onClose={handleCloseModalUpdateDeparment}
                    >
                        <DepartmentView incomingData={updateDepartmentInfo} isModal />
                    </ModalBase>
                )
            }
        </>
    )
}
