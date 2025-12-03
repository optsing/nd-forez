import { defineConfig, loadEnv } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: env.VITE_BASE || '/',
    plugins: [
      react(),
    ],
    worker: {
      format: 'es',
    }
  };
});
