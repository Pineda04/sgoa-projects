import { useState, useEffect, useMemo } from 'react';
import {
	useGetClassroomAvailability,
	TDayOfWeek,
	TOccupiedSlot,
} from '@api/classrooms';
import {
	useGetCurrentAcademicPeriod,
	useGetAcademicPeriods,
} from '@api/periods';
import { Button, ModalBase } from '@shared/components';

interface ClassroomAvailabilityModalProps {
	isOpen: boolean;
	onClose: () => void;
	classroomId: string;
	classroomName: string;
}

const DAYS: { key: TDayOfWeek; label: string; shortLabel: string }[] = [
	{ key: 'MONDAY', label: 'Lunes', shortLabel: 'Lun' },
	{ key: 'TUESDAY', label: 'Martes', shortLabel: 'Mar' },
	{ key: 'WEDNESDAY', label: 'Miércoles', shortLabel: 'Mié' },
	{ key: 'THURSDAY', label: 'Jueves', shortLabel: 'Jue' },
	{ key: 'FRIDAY', label: 'Viernes', shortLabel: 'Vie' },
	{ key: 'SATURDAY', label: 'Sábado', shortLabel: 'Sáb' },
	{ key: 'SUNDAY', label: 'Domingo', shortLabel: 'Dom' },
];

const TIME_SLOTS = [
	'07:00',
	'08:00',
	'09:00',
	'10:00',
	'11:00',
	'12:00',
	'13:00',
	'14:00',
	'15:00',
	'16:00',
	'17:00',
	'18:00',
	'19:00',
	'20:00',
];

function getSlotLabel(time: string) {
	return `${time} - ${String(Number(time.split(':')[0]) + 1).padStart(2, '0')}:00`;
}

function convertTo24h(time: string): string {
	const parts = time.split(' ');
	if (parts.length === 1) return time;
	const [timePart, modifier] = parts;
	let [hours, minutes] = timePart.split(':');
	let h = Number(hours);
	if (modifier.toUpperCase() === 'PM' && h !== 12) h += 12;
	if (modifier.toUpperCase() === 'AM' && h === 12) h = 0;
	return `${String(h).padStart(2, '0')}:${minutes}`;
}

export const ClassroomAvailabilityModal = ({
	isOpen,
	onClose,
	classroomId,
	classroomName,
}: ClassroomAvailabilityModalProps) => {
	const { data: currentPeriod } = useGetCurrentAcademicPeriod();
	const { data: allPeriods } = useGetAcademicPeriods();
	const [selectedYear, setSelectedYear] = useState('');
	const [selectedPac, setSelectedPac] = useState('');

	useEffect(() => {
		if (currentPeriod) {
			setSelectedYear(prev => prev || String(currentPeriod.year));
			setSelectedPac(prev => prev || String(currentPeriod.pac));
		}
	}, [currentPeriod]);

	const years = useMemo(() => {
		if (!allPeriods) return [];
		const uniqueYears = [...new Set(allPeriods.map(p => p.year))];
		return uniqueYears.sort((a, b) => b - a);
	}, [allPeriods]);

	const effectivePeriodId = useMemo(() => {
		if (!selectedYear || !selectedPac) return currentPeriod?.id ?? '';
		const match = allPeriods?.find(
			p =>
				p.year === Number(selectedYear) && p.pac === Number(selectedPac)
		);
		return match?.id ?? '';
	}, [allPeriods, selectedYear, selectedPac, currentPeriod]);

	const { data: schedule, isLoading } = useGetClassroomAvailability(
		classroomId,
		effectivePeriodId,
		undefined
	);

	const occupiedMap = useMemo(() => {
		const map = new Map<string, TOccupiedSlot[]>();
		if (!schedule?.schedule) return map;
		for (const day of DAYS) {
			const daySchedule = schedule.schedule[day.key];
			if (daySchedule?.occupied) {
				const normalized = daySchedule.occupied.map(o => ({
					...o,
					startTime: convertTo24h(o.startTime),
				}));
				map.set(day.key, normalized);
			}
		}
		return map;
	}, [schedule]);

	const availableSet = useMemo(() => {
		const set = new Set<string>();
		if (!schedule?.schedule) return set;
		for (const day of DAYS) {
			const daySchedule = schedule.schedule[day.key];
			if (daySchedule?.available) {
				for (const slot of daySchedule.available) {
					set.add(`${day.key}-${slot.startTime}`);
				}
			}
		}
		return set;
	}, [schedule]);

	function getOccupiedAtSlot(
		dayKey: string,
		time: string
	): TOccupiedSlot | undefined {
		return occupiedMap.get(dayKey)?.find(o => o.startTime === time);
	}

	function isAvailable(dayKey: string, time: string): boolean {
		return availableSet.has(`${dayKey}-${time}`);
	}

	return (
		<ModalBase isOpen={isOpen} onClose={onClose}>
			<div className="p-2 max-h-[calc(90vh-6rem)] overflow-auto">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
					<div>
						<h1 className="text-xl font-bold">
							Disponibilidad de Aula
						</h1>
						<p className="text-sm text-gray-500">{classroomName}</p>
					</div>
					<div className="flex items-center gap-4 flex-wrap">
						<div className="flex items-center gap-2">
							<label className="text-sm font-medium text-foreground whitespace-nowrap">
								Año:
							</label>
							<select
								value={selectedYear}
								onChange={e => setSelectedYear(e.target.value)}
								className="w-full bg-gray-100 cursor-pointer rounded-md px-3 py-1.5 text-sm outline-none border border-input focus:ring-2 focus:ring-primary/20"
							>
								{years.map(y => (
									<option key={y} value={y}>
										{y}
									</option>
								))}
							</select>
						</div>
						<div className="flex items-center gap-2">
							<label className="text-sm font-medium text-foreground whitespace-nowrap">
								PAC:
							</label>
							<select
								value={selectedPac}
								onChange={e => setSelectedPac(e.target.value)}
								className="w-full bg-gray-100 cursor-pointer rounded-md px-3 py-1.5 text-sm outline-none border border-input focus:ring-2 focus:ring-primary/20"
							>
								{[1, 2, 3].map(p => (
									<option key={p} value={p}>
										{p}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-4 mb-4 text-xs">
					<div className="flex items-center gap-1.5">
						<div className="size-3.5 rounded-sm bg-green-400" />
						<span className="text-gray-600">Disponible</span>
					</div>
					<div className="flex items-center gap-1.5">
						<div className="size-3.5 rounded-sm bg-red-400" />
						<span className="text-gray-600">Ocupado</span>
					</div>
				</div>

				{isLoading ? (
					<div className="flex items-center justify-center py-16">
						<div className="size-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
					</div>
				) : !schedule ? (
					<div className="text-center py-16 text-gray-500 text-sm">
						No se pudo cargar la disponibilidad. Selecciona un
						periodo válido.
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full min-w-[640px] border-collapse">
							<thead>
								<tr>
									<th className="sticky left-0 bg-white z-10 p-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border border-gray-200 w-20 min-w-[80px]">
										Horario
									</th>
									{DAYS.filter(
										d => schedule.schedule[d.key]
									).map(day => (
										<th
											key={day.key}
											className="p-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider border border-gray-200"
										>
											<span className="hidden sm:inline">
												{day.label}
											</span>
											<span className="sm:hidden">
												{day.shortLabel}
											</span>
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{TIME_SLOTS.map(time => (
									<tr key={time}>
										<td className="sticky left-0 bg-white z-10 p-2 text-xs font-medium text-gray-600 border border-gray-200 whitespace-nowrap">
											{getSlotLabel(time)}
										</td>
										{DAYS.filter(
											d => schedule.schedule[d.key]
										).map(day => {
											const occupied = getOccupiedAtSlot(
												day.key,
												time
											);
											const available = isAvailable(
												day.key,
												time
											);

											if (occupied) {
												return (
													<td
														key={`${day.key}-${time}`}
														className="group relative p-0 border border-gray-200"
													>
														<div className="bg-red-400 size-full min-h-[36px] cursor-default" />
														<div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:block z-20">
															<div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap max-w-[220px]">
																<p className="font-semibold truncate">
																	{
																		occupied.courseName
																	}
																</p>
																<p className="text-gray-300 truncate">
																	{
																		occupied.teacherName
																	}
																</p>
																<div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
															</div>
														</div>
													</td>
												);
											}

											if (available) {
												return (
													<td
														key={`${day.key}-${time}`}
														className="p-0 border border-gray-200"
													>
														<div className="bg-green-400 size-full min-h-[36px]" />
													</td>
												);
											}

											return (
												<td
													key={`${day.key}-${time}`}
													className="p-0 border border-gray-200"
												>
													<div className="bg-gray-100 size-full min-h-[36px]" />
												</td>
											);
										})}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}

				<div className="flex justify-end pt-4 mt-4 border-t border-gray-100">
					<Button type="button" variant="outline" onClick={onClose}>
						Cerrar
					</Button>
				</div>
			</div>
		</ModalBase>
	);
};
