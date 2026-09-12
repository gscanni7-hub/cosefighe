import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: isSsrBuild
      ? undefined
      : {
          output: {
            // Librerie stabili in file separati: restano in cache tra un deploy e l'altro.
            manualChunks(id) {
              if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router')) return 'react'
              if (id.includes('node_modules/motion') || id.includes('node_modules/framer-motion')) return 'motion'
              if (id.includes('node_modules/lucide-react')) return 'icons'
              return undefined
            },
          },
        },
  },
}))
