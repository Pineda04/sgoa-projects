import { useMemo, useState } from 'react';
import {
	User,
	Building2,
	BookOpen,
	GraduationCap,
	Calendar,
	Briefcase,
	Award,
} from 'lucide-react';
import { useUser } from '@config';
import { useGetCurrentAcademicPeriod } from '@api';
import { getUniqueCenters, Loading } from '@shared';

export const Home = () => {
	const currentUser = useUser();
	const academicPeriodInfo = useGetCurrentAcademicPeriod();
	const [centerSelected, setCenterSelected] = useState(0);
	const isLoading = [currentUser, academicPeriodInfo].some(q => q.isLoading);

	const uniqueCenters = useMemo(
		() => currentUser.user && getUniqueCenters(currentUser.user.positions),
		[currentUser.user]
	);

	const positionsByCenter = useMemo(
		() =>
			currentUser.user?.positions.filter(
				p => p.center.id === uniqueCenters?.[centerSelected]?.id
			) ?? [],
		[currentUser.user, uniqueCenters, centerSelected]
	);

	const facultiesByCenter = useMemo(
		() => positionsByCenter.map(p => p.department.faculty) ?? [],
		[positionsByCenter]
	);

	if (isLoading) return <Loading />;

	if (currentUser.isError || !currentUser.user)
		return (
			<div className="max-w-4xl mx-auto mt-4 sm:mt-6 md:mt-8 mb-8 md:mb-12 px-3 sm:px-4">
				<div className="text-center mb-6 sm:mb-8 md:mb-10">
					<h1 className="text-2xl sm:text-3xl md:text-4xl font-display text-foreground mb-2 sm:mb-3">
						Información Personal
					</h1>
					<p className="text-muted-foreground text-sm sm:text-base">
						Consulta tu información académica y docente
					</p>
				</div>

				<div className="bg-card border-2 border-dashed border-primary/30 rounded-xl md:rounded-2xl shadow-lg shadow-primary/5 p-8 sm:p-12 text-center">
					<div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-br from-primary to-primary-hover rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
						<GraduationCap className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
					</div>
					<h2 className="mt-5 text-lg sm:text-xl font-display text-foreground">
						No se encontró información académica vinculada a este
						usuario
					</h2>
					<p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
						Para poder acceder a ciertas funcionalidades necesitas
						pertenecer a un departamento o cargo académico en el
						sistema.
					</p>
				</div>
			</div>
		);

	return (
		<div className="max-w-4xl mx-auto mt-4 sm:mt-6 md:mt-8 mb-8 md:mb-12 px-3 sm:px-4">
			<div className="animate-in slide-up">
				<div className="text-center mb-6 sm:mb-8 md:mb-10">
					<h1 className="text-2xl sm:text-3xl md:text-4xl font-display text-foreground mb-2 sm:mb-3">
						Información Personal
					</h1>
					<p className="text-muted-foreground text-sm sm:text-base">
						Consulta tu información académica y docente
					</p>
				</div>

				<div className="bg-card border border-card-border rounded-xl md:rounded-2xl shadow-lg shadow-primary/5 overflow-hidden">
					<div className="bg-linear-to-r from-primary to-primary-hover px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6">
						<div className="flex items-center gap-3 sm:gap-4">
							<div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-xl md:rounded-2xl flex items-center justify-center">
								<User className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
							</div>
							<div>
								<h2 className="text-white font-display text-base sm:text-lg md:text-xl">
									{currentUser.user?.name}
								</h2>
								<p className="text-white/70 text-xs sm:text-sm">
									No. Empleado: {currentUser.user?.code}
								</p>
							</div>
						</div>
					</div>

					<div className="p-4 sm:p-6 md:p-8">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
							<FieldCard
								icon={
									<Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
								}
								label="Centro Universitario"
							>
								<select
									value={centerSelected}
									onChange={e =>
										setCenterSelected(
											Number(e.target.value)
										)
									}
									className="w-full bg-transparent border-none text-foreground font-medium
										outline-none cursor-pointer focus:ring-0 p-0 text-sm sm:text-base"
								>
									{uniqueCenters?.map((center, index) => (
										<option key={center.id} value={index}>
											{center.name}
										</option>
									))}
								</select>
							</FieldCard>

							<FieldCard
								icon={
									<BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
								}
								label="Facultad"
							>
								<span className="text-muted-foreground text-sm sm:text-base">
									{facultiesByCenter
										.map(f => f.name)
										.join(', ')}
								</span>
							</FieldCard>

							<FieldCard
								icon={
									<Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
								}
								label="Período Académico"
							>
								<span className="font-medium text-foreground text-sm sm:text-base">
									{academicPeriodInfo.data?.title ||
										'No disponible'}
								</span>
							</FieldCard>

							<FieldCard
								icon={
									<Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
								}
								label="Departamento"
							>
								<span className="text-muted-foreground text-sm sm:text-base">
									{positionsByCenter
										.map(
											p =>
												`${p.department.name} | ${p.position.name}`
										)
										.join(', ')}
								</span>
							</FieldCard>

							<FieldCard
								icon={
									<GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
								}
								label="Formación Académica"
							>
								<div className="space-y-1">
									{currentUser.user?.undergrads.map(
										(u, i) => (
											<p
												key={u.id}
												className="text-xs sm:text-sm text-muted-foreground"
											>
												Pregrado {i + 1}: {u.name}
											</p>
										)
									)}
									{currentUser.user?.postgrads.map((u, i) => (
										<p
											key={u.id}
											className="text-xs sm:text-sm text-muted-foreground"
										>
											Postgrado {i + 1}: {u.name}
										</p>
									))}
									{currentUser.user?.undergrads.length ===
										0 &&
										currentUser.user?.postgrads.length ===
											0 && (
											<p className="text-xs sm:text-sm text-muted-foreground">
												No registrada
											</p>
										)}
								</div>
							</FieldCard>

							<FieldCard
								icon={
									<Award className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
								}
								label="Categoría de Docente"
							>
								<span className="font-medium text-foreground text-sm sm:text-base">
									{currentUser.user?.categoryName ||
										'No asignada'}
								</span>
							</FieldCard>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

function FieldCard({
	icon,
	label,
	children,
}: {
	icon: React.ReactNode;
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="bg-muted/30 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-border/50 hover:border-primary/20 transition-colors duration-200">
			<div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
				<div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center">
					{icon}
				</div>
				<span className="text-xs sm:text-sm font-medium text-muted-foreground">
					{label}
				</span>
			</div>
			<div className="pl-11 sm:pl-13">{children}</div>
		</div>
	);
}
