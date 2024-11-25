import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.', // Project root containing index.html
  build: {
    outDir: 'dist', // Output directory
    rollupOptions: {
      input: 'index.html', // Ensure Vite knows where to start
    },
  },
});
