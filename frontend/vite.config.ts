import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		VitePWA({
			registerType: 'autoUpdate',
			workbox: {
				// Cachea todos los archivos estáticos del build para que la app
				// cargue aunque el monitor no tenga internet al abrir la pestaña.
				globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
			},
			manifest: {
				name: 'SGOA — Sistema de Gestión de Operaciones Académicas',
				short_name: 'SGOA',
				description: 'Sistema de monitoreo y seguimiento académico UNAH',
				theme_color: '#ffffff',
				background_color: '#ffffff',
				display: 'standalone',
				icons: [
					{
						src: '/icons/pwa-192x192.png',
						sizes: '192x192',
						type: 'image/png',
					},
					{
						src: '/icons/pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png',
					},
				],
			},
		}),
	],
	resolve: {
    alias: {
      '@api': resolve(__dirname, './src/api'),
      '@config': resolve(__dirname, './src/config'),
      '@features': resolve(__dirname, './src/features'),
      '@router': resolve(__dirname, './src/router'),
      '@shared': resolve(__dirname, './src/shared'),
		},
	},
});
