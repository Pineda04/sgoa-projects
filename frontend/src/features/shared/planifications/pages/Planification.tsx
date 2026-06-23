import { Button } from '@components/ui/button';
import { PdfFontSelector } from '@components/ui/PdfFontSelector';
import { useLocation } from 'react-router-dom';
import { Loading } from '@components';
import { TPlanification } from '../components/schemas/planification.schemas';
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
	const planificationData: TPlanification[] =
		(coursesInfo.data &&
			coursesInfo.data.flatMap(({ teacher, ...cc }) => ({
				teacherName: teacher.code,
				teacherCode: teacher.name,
				courseCode: cc.course.code,
				courseName: cc.course.name,
				uv: cc.course.uvs,
				section: cc.section,
				studentCount: cc.studentCount,
				days: cc.days,
				center: cc.centerDepartment.center.name,
				classroomName: cc.classroom.name,
				departmentName: cc.course.department.name,
				coordinator: cc.centerDepartment.coordinator.name,
				nearGraduation: cc.nearGraduation,
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
