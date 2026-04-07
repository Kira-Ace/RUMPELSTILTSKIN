import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/RUMPELSTILTSKIN/' : '/',
  plugins: [react()],
  envPrefix: ['VITE_', 'RUMPEL_'],
  server: {
    port: 5173,
    open: true
  }
})
