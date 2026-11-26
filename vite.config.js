import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/dokan-pos-retail-dashboard/' : '/',
  plugins: [react()],
  server: {
    port: 3001,
    open: false
  }
}));
