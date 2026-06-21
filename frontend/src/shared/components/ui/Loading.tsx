import { GraduationCap } from 'lucide-react';
import { createPortal } from 'react-dom';

const portalRoot = document.getElementById('portal-root') ?? document.body;

export const Loading = () => {
	const loading = (
		<div className="fixed inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50">
			<div className="relative">
				<div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary to-primary-hover flex items-center justify-center shadow-lg shadow-primary/30 animate-pulse-glow">
					<GraduationCap className="w-8 h-8 text-white" />
				</div>
				<div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-linear-to-r from-transparent via-primary to-transparent rounded-full overflow-hidden">
					<div className="w-full h-full bg-primary animate-shimmer" />
				</div>
			</div>
			<p className="mt-8 text-sm text-muted-foreground font-medium animate-pulse">
				Cargando...
			</p>
		</div>
	);

	return createPortal(loading, portalRoot);
};
