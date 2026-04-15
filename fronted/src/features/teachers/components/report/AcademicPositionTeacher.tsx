import { EPosition } from '@constants';
import React from 'react';

//Con esto se envia la info a la vista que llame a el componente
export interface IAcademicPositionSelected {
	director: boolean;
	academicSecretary: boolean;
	departmentHead: boolean;
	undergraduateAcademicCoordinator: boolean;
	postgraduateAcademicCoordinator: boolean;
	courseCoordinator: boolean;
	researchCoordinator: boolean;
	universitySocietyLinkageCoordinator: boolean;
	curricularDesignCoordinator: boolean;
	generalCouncilMember: boolean;
	none: boolean;
}

//Cada que se seleccione una checkbox se actualiza los datos seleccionados
interface IProps {
	// values: IAcademicPositionSelected;
	// onChange: (newValues: IAcademicPositionSelected) => void;
	// departmentId: string;
	positionTeacher: string;
}

// Se utiliza el enum, por si cambia en todo solo modificar el enum
const tags: Record<keyof IAcademicPositionSelected, EPosition> = {
	director: EPosition.DIRECTOR,
	academicSecretary: EPosition.ACADEMIC_SECRETARY,
	departmentHead: EPosition.DEPARTMENT_HEAD,
	undergraduateAcademicCoordinator:
		EPosition.UNDERGRADUATE_ACADEMIC_COORDINATOR,
	postgraduateAcademicCoordinator:
		EPosition.POSTGRADUATE_ACADEMIC_COORDINATOR,
	courseCoordinator: EPosition.COURSE_COORDINATOR,
	researchCoordinator: EPosition.RESEARCH_COORDINATOR,
	universitySocietyLinkageCoordinator:
		EPosition.UNIVERSITY_SOCIETY_LINKAGE_COORDINATOR,
	curricularDesignCoordinator: EPosition.CURRICULAR_DESIGN_COORDINATOR,
	generalCouncilMember: EPosition.GENERAL_COUNCIL_MEMBER,
	none: EPosition.NONE,
	// otro: 'Otro (Escríbalo)',
};

export const AcademicPositionTeacher: React.FC<IProps> = ({
	// values: valores,
	// onChange,
	positionTeacher,
}) => {
	// const { data, isPending } = useGetTeacherPosition(departmentId);

	// const handleChangeCheckboc = (campo: keyof IAcademicPositionSelected) => {
	// 	// Colocar todos en false
	// 	for (const [key, value] of Object.entries(valores)) {
	// 		if (value) valores[key as keyof IAcademicPositionSelected] = !value;
	// 	}
	//
	// 	onChange({
	// 		...valores,
	// 		[campo]: !(valores[campo] as boolean),
	// 	});
	// };

	// const handleChangeText = (e: React.ChangeEvent<HTMLInputElement>) => {
	// 	onChange({ ...valores, otro: e.target.value });
	// };

	// Para que quede en 3 columnas, esta asi porque de manera automatica mete los campos con checkbox a la tabla
	const fields = Object.keys(tags) as (keyof IAcademicPositionSelected)[];
	const columns: (keyof IAcademicPositionSelected)[][] = [[], [], []];

	fields.forEach((field, i) => {
		columns[i % 3].push(field);
	});

	return (
		<div className="overflow-x-auto rounded-lg shadow-md mx-auto mt-5">
			<table className="w-full min-w-[400px]">
				<thead className="bg-[#144C74] text-white">
					<tr>
						<th className="px-4 py-2" colSpan={3}>
							Cargo
						</th>
					</tr>
				</thead>
				<tbody>
					{Array.from({
						length: Math.max(...columns.map(col => col.length)),
					}).map((_, rowIndex) => (
						<tr key={rowIndex}>
							{columns.map((culumn, colIndex) => {
								const field = culumn[rowIndex];
								if (!field) return <td key={colIndex}></td>;

								return (
									<td key={field} className="px-4 py-2">
										<label className="flex items-center gap-2">
											<input
												type="checkbox"
												checked={
													positionTeacher ===
													tags[field]
												}
												readOnly
											/>
											{tags[field]}
										</label>
									</td>
								);
							})}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};
