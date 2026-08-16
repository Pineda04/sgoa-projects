import { Button } from '@shared';
import {
	ArrowDownTrayIcon,
	BookOpenIcon,
	EyeIcon,
	QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';

const MANUAL_FILE_ID = '1xsUStvJomtk-dPPea9mOS9WkhIOB3Q8J';
const MANUAL_DOWNLOAD_URL = `https://drive.google.com/uc?export=download&id=${MANUAL_FILE_ID}`;
const MANUAL_VIEW_URL = `https://drive.google.com/file/d/${MANUAL_FILE_ID}/view`;

export const Help = () => {
	return (
		<div className="max-w-3xl mx-auto mt-4 sm:mt-6 md:mt-8 mb-8 md:mb-12 px-3 sm:px-4">
			<div className="animate-in slide-up">
				<div className="bg-card border border-card-border rounded-xl md:rounded-2xl shadow-lg shadow-primary/5 overflow-hidden">
					{/* Header */}
					<div className="bg-linear-to-r from-primary to-primary-hover px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6">
						<div className="flex items-center gap-3 sm:gap-4">
							<div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-xl md:rounded-2xl flex items-center justify-center">
								<QuestionMarkCircleIcon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
							</div>
							<div>
								<h2 className="text-white font-display text-base sm:text-lg md:text-xl">
									Centro de Ayuda
								</h2>
								<p className="text-white/70 text-xs sm:text-sm">
									Manual de usuario del sistema SGOA
								</p>
							</div>
						</div>
					</div>

					{/* Content */}
					<div className="p-4 sm:p-6 md:p-8">
						<div className="flex flex-col items-center text-center">
							<div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
								<BookOpenIcon className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
							</div>
							<h3 className="text-lg sm:text-xl font-display text-foreground">
								Manual de usuario
							</h3>
							<p className="mt-2 max-w-xl text-sm sm:text-base text-muted-foreground">
								Descarga o consulta en línea el manual de
								usuario para conocer el funcionamiento completo
								del sistema, sus módulos y las buenas prácticas
								de uso.
							</p>

							<div className="mt-6 flex flex-col sm:flex-row gap-3">
								<Button
									asChild
									className="bg-[#C40C54] hover:bg-[#FCC40C] hover:text-black text-white px-5 py-2.5 transition flex flex-row gap-2 duration-500"
									variant="unstyled"
									size="lg"
								>
									<a
										href={MANUAL_DOWNLOAD_URL}
										target="_blank"
										rel="noopener noreferrer"
									>
										<ArrowDownTrayIcon className="size-5" />
										Descargar manual
									</a>
								</Button>
								<Button
									asChild
									variant="outline"
									size="lg"
									className="gap-2"
								>
									<a
										href={MANUAL_VIEW_URL}
										target="_blank"
										rel="noopener noreferrer"
									>
										<EyeIcon className="size-5" />
										Ver en línea
									</a>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};