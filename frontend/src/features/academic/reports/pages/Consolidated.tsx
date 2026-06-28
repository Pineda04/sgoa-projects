export const Consolidated = () => {
	return (
		<div className="min-h-screen bg-transparent">
			{/* Título */}
			<div className="px-8 py-6">
				<h2 className="text-2xl font-semibold">
					Consolidado de Rendimiento Académico
				</h2>
			</div>

			{/* Tabla */}
			<div className="w-full overflow-x-auto px-4 pb-10">
				<div className="rounded-xl overflow-hidden shadow-md min-w-max">
					<table className="table-auto w-full text-sm text-center">
						<thead className="bg-[#0A4972] text-white">
							<tr>
								<th className="px-4 py-2">Código</th>
								<th className="px-4 py-2">Asignatura</th>
								<th className="px-4 py-2">Sección</th>
								<th className="px-4 py-2">Inicio</th>
								<th className="px-4 py-2">Final</th>
								<th className="px-4 py-2">ABD</th>
								<th className="px-4 py-2">NSP</th>
								<th className="px-4 py-2">RPB</th>
								<th className="px-4 py-2">APB</th>
								<th className="px-4 py-2">Empleado</th>
								<th className="px-4 py-2">Nombre</th>
								<th className="px-4 py-2">Carrera</th>
								<th className="px-4 py-2">Modalidad</th>
								<th className="px-4 py-2">Índice de aprobación</th>
								<th className="px-4 py-2">Índice de reprobación</th>
								<th className="px-4 py-2">Índice de abandono</th>
								<th className="px-4 py-2">Índice de NSP</th>
								<th className="px-4 py-2">Eficiencia terminal</th>
								<th className="px-4 py-2">Período</th>
								<th className="px-4 py-2">Año</th>
							</tr>
            </thead>
						<tbody className="bg-white">
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};
