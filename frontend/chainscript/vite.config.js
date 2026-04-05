import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Ensure the app is treated as a Single Page Application
  appType: 'spa',
  base: '/',
})
