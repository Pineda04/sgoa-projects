import { exportPlanification } from '../utils';
import { CourseClassroomsTable } from '../components';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '@config/providers';
import { EPdfFont } from '@config/lib';
import { useGetAllCoursesAuthorityByPeriod } from '@api/courses';
import { TPlanification } from '@api/assignment-reports';
import { Button, Loading } from '@shared/components';
import { PdfFontSelector } from '@shared/components/ui/PdfFontSelector';
import { ArrowLeftIcon } from 'lucide-react';

export const PlanificationAuthority = () => {
	const { periodId, centerDepartmentId, year, pac } = useParams();
	const currentUser = useUser();
	const navigate = useNavigate();
	const [selectedFont, setSelectedFont] = useState<EPdfFont | undefined>();

	const coursesInfo = useGetAllCoursesAuthorityByPeriod(
		periodId!,
		centerDepartmentId
	);

	const isLoading = [coursesInfo].some(q => q.isLoading);

	const planificationData: TPlanification[] =
		(coursesInfo.data &&
			coursesInfo.data.flatMap(({ teacher, ...cc }) => ({
				teacherCode: teacher.code,
				teacherName: teacher.name,
				courseCode: cc.course.code,
				courseName: cc.course.name,
				section: cc.section,
				uv: cc.course.uvs,
				days: cc.days,
				studentCount: cc.studentCount,
				classroomName: cc.classroom.name,
				departmentName: cc.course.department.name,
				coordinator: cc.centerDepartment.coordinator.name,
				center: cc.centerDepartment.center.name,
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

			<div className="flex flex-row gap-2 justify-center pt-5">
				<Button
					onClick={() => navigate(-1)}
					variant="outline"
				>
					<ArrowLeftIcon className="size-5" />
					Volver
				</Button>
				<Button
					onClick={() => {
						const userDepartment =
							coursesInfo.data?.[0]?.centerDepartment.department
								.name ?? 'Autoridades';

						exportPlanification(
							planificationData,
							Number(pac),
							Number(year),
							currentUser.user?.name ?? '',
							userDepartment,
							selectedFont
						);
					}}
					className="bg-[#C40C54] text-white px-4 py-2 shadow hover:bg-[#e61766]"
					variant="unstyled"
					size="default"
					disabled={isLoading}
				>
					<DocumentArrowDownIcon className="size-6" />
					Descargar PDF
				</Button>
				<PdfFontSelector
					onChange={font => {
						setSelectedFont(font);
					}}
				/>
			</div>

			<CourseClassroomsTable
				coursesInfo={coursesInfo.data ?? []}
				isWhithActions={false}
			/>
		</>
	);
};
