import { Link, Navigate, useParams } from 'react-router-dom';
import { DocumentPlusIcon } from '@heroicons/react/24/outline';
import { CourseList } from '@features/academic/courses';
import { useTabWithReset } from '@shared/hooks';
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/components';
import { InfoCoordinator, ListAcademicAssignmentReports, ListPlanificationsCoordinator, UsersCoordinator } from '../components';

export const DashboardCoordinator = () => {
	const { centerDepartmentId } = useParams();
	const validTabs = ['0', '1', '2', '3'];
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
					<TabsTrigger value="1">Gestión de usuarios</TabsTrigger>
					<TabsTrigger value="2">Reportes</TabsTrigger>
					<TabsTrigger value="3">Clases</TabsTrigger>
				</TabsList>

				<TabsContent value="0">
					<div className="flex flex-row gap-10 justify-center mb-2 mt-4">
						<Link
							to={`/academic/planifications/new/${centerDepartmentId}`}
							style={{
								pointerEvents: centerDepartmentId
									? 'auto'
									: 'none',
							}}
						>
							<Button
								className="bg-[#5BC85C] hover:bg-green-300 duration-500"
								disabled={!centerDepartmentId}
							>
								<DocumentPlusIcon className="size-6" />
								Agregar planificación
							</Button>
						</Link>
					</div>

					<ListPlanificationsCoordinator
						key={centerDepartmentId}
						centerDepartmentId={centerDepartmentId ?? ''}
					/>
				</TabsContent>

				<TabsContent value="1">
					<UsersCoordinator
						key={centerDepartmentId}
						centerDepartmentId={centerDepartmentId ?? ''}
					/>
				</TabsContent>

				<TabsContent value="2">
					<ListAcademicAssignmentReports
						key={centerDepartmentId}
						centerDepartmentId={centerDepartmentId ?? ''}
					/>
				</TabsContent>

				<TabsContent value="3">
					<CourseList
						centerDepartmentId={centerDepartmentId ?? ''}
						// showDepartmentInTable
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
};
