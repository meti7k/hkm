import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  preview: {
    host: true,
    port: 6565,
    allowedHosts: ['hkm.activen.org']
  }
});
