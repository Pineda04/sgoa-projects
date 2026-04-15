import { Button } from '@components/ui/button';
import { PdfFontSelector } from '@components/ui/PdfFontSelector';
import { useLocation } from 'react-router-dom';
import { Loading } from '@components';
import { IPlanification } from '../types';
import { exportPlanification } from '../utils';
import { useGetAllCoursesCoordinatorByPeriod } from '@features/coordinators';
import { useUser } from '@providers/user';
import { CourseClassroomsTable } from '../components';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { EPdfFont } from '@lib/pdf-config';
import { useState } from 'react';

// FIX: Segmentar segun el rol
export const Planification = () => {
	const location = useLocation();
	const currentUser = useUser();
	const { year, pac, periodId, centerDepartmentId } = location.state ?? {};
	const [selectedFont, setSelectedFont] = useState<EPdfFont | undefined>();

	// const assignmentsInfo =
	// 	useGetAcademicAssignmentCoordinatorByPeriodAndCenter(
	// 		periodId,
	// 		centerDepartmentId
	// 	);
	const coursesInfo = useGetAllCoursesCoordinatorByPeriod(
		periodId,
		centerDepartmentId
	);

	// Obtener la info de coordicacion, ya que esta pagina solo sera visible para coordinadores
	// const centerDepartmentInfo = useGetTeacherPosition(centerDepartmentId);

	const isLoading = [coursesInfo].some(q => q.isLoading);

	// const isError = [assignmentsInfo, coursesInfo, departmentsInfo].some(
	//   (q) => q.isError,
	// );

	//datos del PDF
	const planificationData: IPlanification[] =
		(coursesInfo.data &&
			coursesInfo.data.flatMap(({ teacher, ...cc }) => ({
				teacherName: teacher.code,
				tacherCode: teacher.name,
				code: cc.course.code,
				name: cc.course.name,
				section: cc.section,
				uvs: cc.course.uvs,
				days: cc.days,
				studentCount: cc.studentCount,
				classroom: cc.classroom.name,
				department: cc.course.department.name,
				// coordinator: centerDepartmentInfo.data?.teacherName ?? '',
				// center: centerDepartmentInfo.data?.center ?? '',
				coordinator: cc.centerDepartment.coordinator.name,
				center: cc.centerDepartment.center.name,
				observation: cc.observation ?? '',
			}))) ??
		[];

	return (
		<>
			{isLoading && <Loading />}

			<div className="text-center">
				<h1 className="text-2xl font-semibold mb-3">
					UNAH Campus Copán
				</h1>
				<h2 className="text-md">
					Asignación Académica {pac}º Periodo Académico Presencial{' '}
					{year}
				</h2>
			</div>

			{/*Exportar PDF*/}
			<div className="flex flex-row gap-10 justify-center pt-10">
					<Button
						onClick={() => {
							// NOTE: Un docente puede ser coordinador de varias carreras.
							const userDepartment =
								currentUser.headPositions.find(
									p => p.centerDepartmentId === centerDepartmentId
								)?.department.name ?? '';

							exportPlanification(
								planificationData,
								pac,
								year,
								currentUser.user?.name ?? '',
								userDepartment,
								selectedFont
							);
						}}
						className="bg-[#C40C54] text-white px-4 py-2 shadow hover:bg-[#e61766]"
						variant="unstyled"
						size="default"
					>
						<DocumentArrowDownIcon className="size-6" />
						Descargar PDF
					</Button>
					<PdfFontSelector
						onChange={(font) => {
							setSelectedFont(font);
						}}
					/>
			</div>

			{/*Asignaciones de la carrera del coordi*/}
			<CourseClassroomsTable coursesInfo={coursesInfo.data ?? []} />
		</>
	);
};
