import { useGetDepartments } from "@api/departments"
import { DepartmentTable } from "../components"
import { useNavigate } from "react-router-dom"


export const ListDepartments = () => {

  const { isLoading, isError, data } = useGetDepartments();
  const navigate = useNavigate();

  if (isError) {
    return <p>Error al cargar los departamentos. Intenta nuevamente</p>;
  }

  if (!data && !isLoading) {
    // TODO: Se puede agregar una tabla vacia o agregar algun texto como vacio o icono
    return <p>No hay departamentos agregados...</p>;
  }

  return (
    <>
      {
        data && (
          <DepartmentTable
            data={data}
            isError={isError}
            isLoading={isLoading}
            onNavigateToCreate={() => navigate('/admin/departments/new')}
          />
        )
      }
    </>
  )
}
