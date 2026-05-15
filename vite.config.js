import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build: {
    // Strip all console.* calls in production build
    minify: 'esbuild',
    ...(mode === 'production' && {
      esbuildOptions: {
        drop: ['console', 'debugger'],
      },
    }),
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
}))
