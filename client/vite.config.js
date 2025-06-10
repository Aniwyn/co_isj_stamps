import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'

dotenv.config()
const PORT = parseInt(process.env.VITE_PORT) || 5173

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: PORT,
  },
})