import { useTabWithReset } from '@shared/hooks';
import {
	Loading,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '@shared/components';
import { AcademicPeriodsList, Consolidated, CourseList } from '@features/academic';
import { useAbility } from '@config/lib';
import { UsersTable } from '@features/admin';
import { useGetTeachers } from '@api/teachers';
import { useNavigate } from 'react-router-dom';
import {
	ListAssignmentReportsAuthorities,
	ListPlanificationsAuthorities,
} from '../components';
import { useGetCurrentAcademicPeriod } from '@api/periods';
import { useUser } from '@config/providers';

// Subcomponente que encapsula la petición de usuarios, se monta solo al activar la pestaña
const UsersTab = () => {
	const navigate = useNavigate();
	const { isLoading, isError, data } = useGetTeachers();

	return (
		<UsersTable
			isLoading={isLoading}
			isError={isError}
			data={data ?? null}
			onNavigateToCreate={() => navigate('/admin/users/new')}
		/>
	);
};

export const DashboardAuthorities = () => {

	const currentUser = useUser();
	const academicPeriodInfo = useGetCurrentAcademicPeriod();
	const isLoading = [currentUser, academicPeriodInfo].some(q => q.isLoading);

	const ability = useAbility();
	const showDepartment = ability.can('manage', 'departments');
	const validTabs = ['0', '1', '2', '3', '4', '5'];
	const { currentTab, setTab } = useTabWithReset(validTabs);

	if (isLoading) return <Loading />;

	return (
		<>
			<div className="mb-6">
				<h2 className="text-2xl font-semibold">
					UNAH PAC{' '}{academicPeriodInfo.data?.title ?? '...'}
				</h2>
				<p className="text-sm">{currentUser.user?.name}</p>
				<p className="text-sm">{currentUser.user?.code}</p>
				<p className="text-sm">{currentUser.user?.email}</p>
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
					{currentTab === '0' && <ListPlanificationsAuthorities />}
				</TabsContent>

				{/* Informes */}
				<TabsContent value="1">
					{currentTab === '1' && <ListAssignmentReportsAuthorities />}
				</TabsContent>

				{/* Usuarios */}
				<TabsContent value="2">
					{currentTab === '2' && <UsersTab />}
				</TabsContent>

				{/* Clases */}
				<TabsContent value="3">
					{currentTab === '3' && <CourseList showDepartmentFilter showDepartmentInTable={showDepartment} />}
				</TabsContent>

				{/* Periodos */}
				<TabsContent value="4">
					{currentTab === '4' && <AcademicPeriodsList />}
				</TabsContent>

				{/* Consolidado */}
				<TabsContent value="5">
					{currentTab === '5' && <Consolidated showDepartmentFilter />}
				</TabsContent>
			</Tabs>
		</>
	);
};
