import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = process.env;
  const port = Number(env.VITE_PORT || env.PORT || 5173);
  return {
    plugins: [react()],
    server: {
      port,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:5010',
          changeOrigin: true,
          secure: false
        }
      }
    },
    preview: {
      host: '0.0.0.0',
      port: 80,
      allowedHosts: ['all']
    }
  };
});
