import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../../reservation_service/app/static/widget',
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      entry: 'src/main.tsx',
      name: 'LaKremeWidget',
      fileName: () => 'lakreme-widget.js',
      formats: ['iife'],
    },
    rollupOptions: {
      // In IIFE mode for a Web Component widget, we want to bundle React INSIDE the file.
      // Do NOT externalize react/react-dom.
    }
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});
