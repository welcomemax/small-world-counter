/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  // Filesystem events are unreliable in this sandbox, so watch by polling.
  server: {
    watch: { usePolling: true, interval: 300 },
  },
  test: {
    environment: 'node',
  },
})
