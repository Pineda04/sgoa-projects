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
	defaultPeriodId?: string;
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

// Índice de JS Date.getDay() (0 = domingo) mapeado al key de cada día
const JS_DAY_TO_KEY: TDayOfWeek[] = [
	'SUNDAY',
	'MONDAY',
	'TUESDAY',
	'WEDNESDAY',
	'THURSDAY',
	'FRIDAY',
	'SATURDAY',
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
	const [hours, minutes] = timePart.split(':');
	let h = Number(hours);
	if (modifier.toUpperCase() === 'PM' && h !== 12) h += 12;
	if (modifier.toUpperCase() === 'AM' && h === 12) h = 0;
	return `${String(h).padStart(2, '0')}:${minutes}`;
}

function to12h(time: string): string {
	const [hStr, m] = time.split(':');
	const h = Number(hStr);
	const ampm = h >= 12 ? 'PM' : 'AM';
	const h12 = h % 12 || 12;
	return `${h12}:${m} ${ampm}`;
}

export const ClassroomAvailabilityModal = ({
	isOpen,
	onClose,
	classroomId,
	classroomName,
	defaultPeriodId,
}: ClassroomAvailabilityModalProps) => {
	const { data: currentPeriod } = useGetCurrentAcademicPeriod();
	const { data: allPeriods } = useGetAcademicPeriods();
	const [selectedYear, setSelectedYear] = useState('');
	const [selectedPac, setSelectedPac] = useState('');
	const [expandedDay, setExpandedDay] = useState<TDayOfWeek | null>(null);

	const todayKey = useMemo(() => JS_DAY_TO_KEY[new Date().getDay()], []);

	const defaultPeriod = useMemo(() => {
		if (defaultPeriodId)
			return allPeriods?.find(p => p.id === defaultPeriodId);
		return currentPeriod;
	}, [allPeriods, defaultPeriodId, currentPeriod]);

	useEffect(() => {
		if (defaultPeriod) {
			setSelectedYear(prev => prev || String(defaultPeriod.year));
			setSelectedPac(prev => prev || String(defaultPeriod.pac));
		}
	}, [defaultPeriod]);

	const years = useMemo(() => {
		if (!allPeriods) return [];
		const uniqueYears = [...new Set(allPeriods.map(p => p.year))];
		return uniqueYears.sort((a, b) => b - a);
	}, [allPeriods]);

	const effectivePeriodId = useMemo(() => {
		if (!selectedYear || !selectedPac)
			return defaultPeriodId ?? currentPeriod?.id ?? '';
		const match = allPeriods?.find(
			p =>
				p.year === Number(selectedYear) && p.pac === Number(selectedPac)
		);
		return match?.id ?? '';
	}, [allPeriods, selectedYear, selectedPac, defaultPeriodId, currentPeriod]);

	const { data: schedule, isLoading, isError } = useGetClassroomAvailability(
		classroomId,
		effectivePeriodId,
		undefined
	);

	const activeDays = useMemo(
		() => DAYS.filter(d => schedule?.schedule?.[d.key]),
		[schedule]
	);

	// Al cargar el horario, abre por defecto el día de hoy (o el primero disponible) en la vista móvil
	useEffect(() => {
		if (activeDays.length === 0) {
			setExpandedDay(null);
			return;
		}
		const hasToday = activeDays.some(d => d.key === todayKey);
		setExpandedDay(hasToday ? todayKey : activeDays[0].key);
	}, [activeDays, todayKey]);

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

	const stats = useMemo(() => {
		let available = 0;
		let occupied = 0;
		for (const day of activeDays) {
			for (const time of TIME_SLOTS) {
				if (getOccupiedAtSlotFrom(occupiedMap, day.key, time)) occupied += 1;
				else if (availableSet.has(`${day.key}-${time}`)) available += 1;
			}
		}
		return { available, occupied };
	}, [activeDays, occupiedMap, availableSet]);

	function getOccupiedAtSlotFrom(
		map: Map<string, TOccupiedSlot[]>,
		dayKey: string,
		time: string
	): TOccupiedSlot | undefined {
		return map.get(dayKey)?.find(o => o.startTime === time);
	}

	function getOccupiedAtSlot(
		dayKey: string,
		time: string
	): TOccupiedSlot | undefined {
		return getOccupiedAtSlotFrom(occupiedMap, dayKey, time);
	}

	function isAvailable(dayKey: string, time: string): boolean {
		return availableSet.has(`${dayKey}-${time}`);
	}

	return (
		<ModalBase isOpen={isOpen} onClose={onClose} showCloseButton={false}>
			<div className="flex max-h-[calc(90vh-6rem)] flex-col p-2">
				{/* Encabezado */}
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

				{!isLoading && schedule && (
					<div className="mb-4 flex flex-wrap items-center gap-2">
						<div className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
							<div className="size-2 rounded-full bg-green-400" />
							{stats.available} horas libres
						</div>
						<div className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
							<div className="size-2 rounded-full bg-red-400" />
							{stats.occupied} horas ocupadas
						</div>
					</div>
				)}

				<div className="min-h-0 flex-1 overflow-auto">
					{isLoading ? (
						<AvailabilitySkeleton />
					) : isError ? (
						<div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth={1.5}
								className="size-10 text-gray-300"
							>
								<circle cx="12" cy="12" r="9" />
								<path d="M9.5 9.5l5 5M14.5 9.5l-5 5" />
							</svg>
							<p className="text-sm font-medium text-gray-600">
								No se pudo cargar la disponibilidad
							</p>
							<p className="text-xs text-gray-400">
								Selecciona un periodo válido para continuar
							</p>
						</div>
					) : !schedule || activeDays.length === 0 ? (
						<div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth={1.5}
								className="size-10 text-gray-300"
							>
								<rect x="3" y="4" width="18" height="18" rx="2" />
								<path d="M16 2v4M8 2v4M3 10h18" />
							</svg>
							<p className="text-sm font-medium text-gray-600">
								Sin horario asignado
							</p>
							<p className="text-xs text-gray-400">
								Este periodo no tiene horarios registrados para el aula
							</p>
						</div>
					) : (
						<>
							{/* Vista móvil: acordeón por día */}
							<div className="flex flex-col gap-2 sm:hidden">
								{activeDays.map(day => {
									const isOpen = expandedDay === day.key;
									const isToday = day.key === todayKey;
									return (
										<div
											key={day.key}
											className="overflow-hidden rounded-lg border border-gray-200"
										>
											<button
												type="button"
												onClick={() =>
													setExpandedDay(isOpen ? null : day.key)
												}
												className="flex w-full items-center justify-between px-3 py-2.5 text-left"
											>
												<span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
													{day.label}
													{isToday && (
														<span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-600">
															Hoy
														</span>
													)}
												</span>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth={2}
													className={`size-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
												>
													<path d="M6 9l6 6 6-6" />
												</svg>
											</button>
											{isOpen && (
												<div className="flex flex-col divide-y divide-gray-100 border-t border-gray-100">
													{TIME_SLOTS.map(time => {
														const occupied = getOccupiedAtSlot(
															day.key,
															time
														);
														const available = isAvailable(day.key, time);
														return (
															<div
																key={time}
																className="flex items-center gap-3 px-3 py-2"
															>
																<span className="w-24 shrink-0 text-xs font-medium text-gray-500">
																	{getSlotLabel(time)}
																</span>
																{occupied ? (
																	<div className="min-w-0 flex-1 rounded-md bg-red-50 px-2 py-1">
																		<p className="truncate text-xs font-semibold text-red-700">
																			{occupied.courseName}
																		</p>
																		<p className="truncate text-[11px] text-red-500">
																			{occupied.teacherName}
																		</p>
																	</div>
																) : available ? (
																	<div className="flex-1 rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
																		Disponible
																	</div>
																) : (
																	<div className="flex-1 rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-400">
																		No aplica
																	</div>
																)}
															</div>
														);
													})}
												</div>
											)}
										</div>
									);
								})}
							</div>

							{/* Vista desktop: tabla */}
							<div className="hidden overflow-x-auto rounded-lg border border-gray-200 sm:block">
								<table className="w-full min-w-160 table-fixed border-collapse">
									<thead>
										<tr>
											<th className="sticky left-0 top-0 z-20 w-25 min-w-20 border-b border-r border-gray-200 bg-gray-50 p-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
												Horario
											</th>
											{activeDays.map(day => (
												<th
													key={day.key}
													className={`sticky top-0 z-10 border-b border-gray-200 p-2 text-center text-xs font-semibold uppercase tracking-wider ${
														day.key === todayKey
															? 'bg-indigo-50 text-indigo-700'
															: 'bg-gray-50 text-gray-500'
													}`}
												>
													{day.label}
													{day.key === todayKey && (
														<span className="ml-1.5 rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-medium normal-case text-indigo-600">
															hoy
														</span>
													)}
												</th>
											))}
										</tr>
									</thead>
									<tbody>
										{TIME_SLOTS.map((time, rowIdx) => (
											<tr key={time}>
												<td
													className={`sticky left-0 z-10 border-r border-gray-200 p-2 text-xs font-medium text-gray-600 ${
														rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'
													}`}
												>
													{getSlotLabel(time)}
												</td>
												{activeDays.map(day => {
													const occupied = getOccupiedAtSlot(day.key, time);
													const available = isAvailable(day.key, time);
													const isToday = day.key === todayKey;

													if (occupied) {
														return (
															<td
																key={`${day.key}-${time}`}
																className="group relative border border-gray-100 p-0"
															>
																<div className="size-full min-h-8.5 cursor-default bg-red-400/90 transition-colors hover:bg-red-500" />
																<div className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-1.5 hidden -translate-x-1/2 group-hover:block">
																	<div className="max-w-55 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg">
																		<p className="truncate font-semibold">
																			{occupied.courseName}
																		</p>
																		<p className="truncate text-gray-300">
																			{occupied.teacherName}
																		</p>
																		<div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
																	</div>
																</div>
															</td>
														);
													}

													if (available) {
														return (
															<td
																key={`${day.key}-${time}`}
																className="group relative border border-gray-100 p-0"
															>
																<div className="size-full min-h-8.5 bg-green-400/80 transition-colors hover:bg-green-500" />
																<div className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-1.5 hidden -translate-x-1/2 group-hover:block">
																	<div className="whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg">
																		{day.label} {to12h(time)} - {to12h(String(Number(time.split(':')[0]) + 1).padStart(2, '0') + ':00')}
																		<div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
																	</div>
																</div>
															</td>
														);
													}

													return (
														<td
															key={`${day.key}-${time}`}
															className="border border-gray-100 p-0"
														>
															<div
																className={`size-full min-h-8.5 ${
																	isToday ? 'bg-indigo-50/40' : 'bg-gray-50'
																}`}
															/>
														</td>
													);
												})}
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</>
					)}
				</div>

				<div className="mt-4 flex justify-end border-t border-gray-100 pt-4">
					<Button type="button" variant="outline" onClick={onClose}>
						Cerrar
					</Button>
				</div>
			</div>
		</ModalBase>
	);
};

function AvailabilitySkeleton() {
	return (
		<div className="animate-pulse">
			<div className="hidden gap-1 sm:flex">
				<div className="h-8 w-20 shrink-0 rounded bg-gray-100" />
				{Array.from({ length: 5 }).map((_, i) => (
					<div key={i} className="h-8 flex-1 rounded bg-gray-100" />
				))}
			</div>
			<div className="mt-1 flex flex-col gap-1">
				{Array.from({ length: 8 }).map((_, r) => (
					<div key={r} className="flex gap-1">
						<div className="h-9 w-20 shrink-0 rounded bg-gray-100 sm:w-20" />
						{Array.from({ length: 5 }).map((_, c) => (
							<div key={c} className="h-9 flex-1 rounded bg-gray-100" />
						))}
					</div>
				))}
			</div>
		</div>
	);
}
