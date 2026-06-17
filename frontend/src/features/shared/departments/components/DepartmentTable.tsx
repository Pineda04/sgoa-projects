import type { IResponse } from "@types";
import { DataTable, IDataTableColumn, ModalBase } from "@components";
import { Button } from '@components/ui/button';
import { TOutputDepartment } from "@features/centers";
import { useModal } from '@hooks';
import { EyeIcon, Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { DepartmentView } from "./DepartmentView";
//import { DepartmentView } from "./DepartmentView";

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
      render: (row: TOutputDepartment) => row.uvs !== null ? row.uvs : '-'
    },
    { key: 'facultyName', header: 'Facultad', mobileLabel: 'Facultad' },
    {
      key: 'actions',
      header: 'Acciones',
      mobileLabel: 'Acciones',
      render: (row: TOutputDepartment) => (
        <Button
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
