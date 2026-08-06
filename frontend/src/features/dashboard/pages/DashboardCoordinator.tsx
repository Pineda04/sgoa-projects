import { Navigate, useParams } from 'react-router-dom';
import { CourseList } from '@features/academic/courses';
import { useTabWithReset } from '@shared/hooks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/components';
import {
	InfoCoordinator,
	ListAcademicAssignmentReports,
	ListPlanificationsCoordinator,
	UsersCoordinator,
} from '../components';
import { Consolidated } from '@features/academic';

export const DashboardCoordinator = () => {
	const { centerDepartmentId } = useParams();
	const validTabs = ['0', '1', '2', '3', '4'];
	const { currentTab, setTab } = useTabWithReset(validTabs);

	if (!centerDepartmentId) return <Navigate to="/" />;

	return (
		<div className="pb-8 sm:pb-12">
			<InfoCoordinator centerDepartmentId={centerDepartmentId} />

			<Tabs
				value={currentTab}
				onValueChange={setTab}
				className="mt-4 sm:mt-8"
			>
				<TabsList variant="pills" className="mb-4 sm:mb-6">
					<TabsTrigger value="0">Planificaciones</TabsTrigger>
					<TabsTrigger value="1">Informes</TabsTrigger>
					<TabsTrigger value="2">Usuarios</TabsTrigger>
					<TabsTrigger value="3">Clases</TabsTrigger>
					<TabsTrigger value="4">Consolidado</TabsTrigger>
				</TabsList>

				{/* Planificaciones */}
				<TabsContent value="0">
					<ListPlanificationsCoordinator
						key={centerDepartmentId}
						centerDepartmentId={centerDepartmentId ?? ''}
					/>
				</TabsContent>

				{/* Informes */}
				<TabsContent value="1">
					<ListAcademicAssignmentReports
						key={centerDepartmentId}
						centerDepartmentId={centerDepartmentId ?? ''}
					/>
				</TabsContent>

				{/* Usuarios */}
				<TabsContent value="2">
					<UsersCoordinator
						key={centerDepartmentId}
						centerDepartmentId={centerDepartmentId ?? ''}
					/>
				</TabsContent>

				{/* Clases */}
				<TabsContent value="3">
					<CourseList
						centerDepartmentId={centerDepartmentId ?? ''}
						// showDepartmentInTable
					/>
				</TabsContent>

				{/* Consolidado */}
				<TabsContent value="4">
					<Consolidated centerDepartmentId={centerDepartmentId} />
				</TabsContent>
			</Tabs>
		</div>
	);
};
