import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true,
    cors: true,
    // HTTPS disabled - using standard HTTP localhost
    // https: {
    //   key: fs.readFileSync(path.resolve('../.certs/localhost-key.pem')),
    //   cert: fs.readFileSync(path.resolve('../.certs/localhost.pem')),
    // },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  },
})
