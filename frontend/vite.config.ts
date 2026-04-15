import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			'@lib': resolve(__dirname, './src/lib'),
			'@utils': resolve(__dirname, './src/utils'),
			'@types': resolve(__dirname, './src/types'),
			'@constants': resolve(__dirname, './src/constants'),
			'@features': resolve(__dirname, './src/features'),
			'@providers': resolve(__dirname, './src/providers'),
			'@hooks': resolve(__dirname, './src/hooks'),
			'@components': resolve(__dirname, './src/components'),
			'@schemas': resolve(__dirname, './src/schemas'),
			'@assets': resolve(__dirname, './src/assets'),
		},
	},
});
