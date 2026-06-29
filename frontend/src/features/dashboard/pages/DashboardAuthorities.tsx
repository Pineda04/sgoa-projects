import { useState } from 'react';
import { useTabWithReset } from '@shared/hooks';
import {
	IResponsiveColumn,
	ResponsiveTable,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '@shared/components';
import { AcademicPeriodsList, Consolidated, CourseList, ListPlanificationsTable } from '@features/academic';
import { useAbility } from '@config/lib';
import { UsersTable } from '@features/admin';
import { useGetTeachers } from '@api/teachers';
import { useNavigate } from 'react-router-dom';

interface FileData {
	id: string;
	name: string;
}

export const DashboardAuthorities = () => {
	const navigate = useNavigate();
  const ability = useAbility();
	const showDepartment = ability.can('manage', 'departments');
	const [searchPlanification, setSearchPlanification] = useState('');
	const [searchReport, setSearchReport] = useState('');
	const validTabs = ['0', '1', '2', '3', '4', '5'];
  const { currentTab, setTab } = useTabWithReset(validTabs);

  const { isLoading, isError, data } = useGetTeachers();
	const [isLoadingPlanifications] = useState(false);
	const [isErrorPlanifications] = useState(false);

	const reportColumns: IResponsiveColumn<FileData>[] = [
		{ key: 'name', header: 'Nombre del archivo', mobileLabel: 'Archivo' },
		{ key: 'view', header: 'Ver contenido', mobileLabel: 'Ver' },
		{ key: 'download', header: 'Descargar', mobileLabel: 'Descargar' },
	];
  const emptyReports: FileData[] = [];

	return (
		<>
			<div className="mb-6">
				<h2 className="text-2xl font-semibold">
					UNAH - Campus Copán III PAC 2025
				</h2>
				<p className="text-sm">Nombre de Autoridad</p>
				<p className="text-sm">10355</p>
				<p className="text-sm">correo@unah.edu</p>
			</div>

			<Tabs value={currentTab} onValueChange={setTab} className="mt-4 sm:mt-8">
				<TabsList variant="pills" className="mb-4 sm:mb-6">
					<TabsTrigger value="0">Planificaciones</TabsTrigger>
					<TabsTrigger value="1">Informes</TabsTrigger>
					<TabsTrigger value="2">Usuarios</TabsTrigger>
					<TabsTrigger value="3">Clases</TabsTrigger>
					<TabsTrigger value="4">Periodos</TabsTrigger>
					<TabsTrigger value="5">Consolidado</TabsTrigger>
				</TabsList>

				{/* Planificaciones */}
				<TabsContent value="0">
					<div className="flex justify-center my-4">
						<input
							type="text"
							placeholder="Buscar planificación..."
							value={searchPlanification}
							onChange={e =>
								setSearchPlanification(e.target.value)
							}
							className="w-full bg-white shadow-md rounded-md px-3 py-2 outline-none border border-input focus:ring-2 focus:ring-primary/20 transition-colors"
						/>
					</div>

					<ListPlanificationsTable
						isLoading={isLoadingPlanifications}
						isError={isErrorPlanifications}
						data={null}
					/>
				</TabsContent>

				{/* Informes */}
				<TabsContent value="1">
					<div className="flex justify-center my-4">
						<input
							type="text"
							placeholder="Buscar informe..."
							value={searchReport}
							onChange={e => setSearchReport(e.target.value)}
							className="w-full bg-white shadow-md rounded-md px-3 py-2 outline-none border border-input focus:ring-2 focus:ring-primary/20 transition-colors"
						/>
					</div>

					<div className="py-2 bg-white">
						<ResponsiveTable<FileData>
							columns={reportColumns}
							data={emptyReports}
							getRowKey={f => f.id}
							emptyMessage="No hay informes disponibles"
							showRowNumber={false}
						/>
					</div>
				</TabsContent>

				{/* Usuarios */}
				<TabsContent value="2">
		      {data && (
  					<UsersTable
  						isLoading={isLoading}
  						isError={isError}
  						data={data}
  						onNavigateToCreate={() => navigate('/admin/users/new')}
  					/>
  				)}
        </TabsContent>

				{/* Clases */}
				<TabsContent value="3">
				  <CourseList showDepartmentFilter showDepartmentInTable={showDepartment} />
				</TabsContent>

        {/* Periodos */}
				<TabsContent value="4">
				  <AcademicPeriodsList />
				</TabsContent>

        {/* Consolidado */}
				<TabsContent value="5">
				  <Consolidated />
				</TabsContent>
			</Tabs>
		</>
	);
};
