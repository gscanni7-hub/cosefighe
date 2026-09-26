import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { existsSync, readdirSync } from 'node:fs'

// Foto che hanno la variante da 800 px in public/img/800/: solo queste ricevono lo srcset (vedi src/lib/img.ts).
const img800 = existsSync('public/img/800') ? readdirSync('public/img/800').filter((f) => f.endsWith('.webp')) : []

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), tailwindcss()],
  define: { __IMG800__: JSON.stringify(img800) },
  // In produzione niente console: chi apre gli strumenti del browser non deve leggere i nostri messaggi interni.
  esbuild: { drop: ['console', 'debugger'] },
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
