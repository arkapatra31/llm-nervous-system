import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves this project under /llm-nervous-system/.
// In dev we use '/' so the local server works at the root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/llm-nervous-system/' : '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing', 'postprocessing'],
          tokenizer: ['gpt-tokenizer'],
          katex: ['katex'],
        },
      },
    },
  },
}))
