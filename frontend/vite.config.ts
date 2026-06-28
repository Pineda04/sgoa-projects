import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
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
