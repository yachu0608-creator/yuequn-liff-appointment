import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist-high-fi',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        prototype: `${import.meta.dirname}/high-fi/index.html`,
        figmaHomepage: `${import.meta.dirname}/high-fi/figma-homepage.html`,
      },
    },
  },
})
