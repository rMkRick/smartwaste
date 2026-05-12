import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true, // Abre el navegador automáticamente
    port: 5173  // Asegura el puerto por defecto
  }
})
