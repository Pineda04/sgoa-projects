import { useGetDepartments } from "@api/departments";
import { DepartmentTable } from "../components";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@config";

export const ListDepartments = () => {
  const { authState: { user } } = useAuth();
  const { isLoading, isError, data } = useGetDepartments();
  const navigate = useNavigate();

  const roles = user?.roles ?? [];
  const isDocenteOnly = roles.includes('DOCENTE') && !roles.some(r => ['ADMIN', 'DIRECCION', 'RRHH', 'COORDINADOR_AREA'].includes(r));

  if (isDocenteOnly) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="pb-8 sm:pb-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Gestión de Departamentos
        </h1>
        <p className="text-muted-foreground mt-1">
          Visualice todos los departamentos disponibles.
        </p>
      </div>
      {
        isError ? (
          <p>Error al cargar los departamentos. Intenta nuevamente</p>
        ) :
          !data && !isLoading ? (
            <p>No hay departamentos agregados...</p>
          ) :
            data && (
              <DepartmentTable
                data={data}
                isError={isError}
                isLoading={isLoading}
                onNavigateToCreate={() => navigate('/admin/departments/new')}
              />
            )
      }
    </div>
  )
}
