import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import electron from 'vite-plugin-electron/simple'
import path from 'path'

const isElectron = process.env.ELECTRON === '1'

export default defineConfig({
  // Use relative paths so assets load from file:// in packaged Electron
  base: isElectron ? './' : '/',

  plugins: [
    react(),
    tailwindcss(),

    // Only activate Electron plugin during the electron dev/build workflow
    ...(isElectron
      ? [
          electron({
            main: {
              // Compiled by vite-plugin-electron using esbuild (no extra tsconfig needed)
              entry: 'electron/main.ts',
              vite: {
                build: {
                  outDir: 'dist-electron',
                  rollupOptions: {
                    external: ['electron', 'simple-git'],
                  },
                },
              },
            },
            preload: {
              input: 'electron/preload.ts',
              vite: {
                build: {
                  outDir: 'dist-electron',
                  rollupOptions: {
                    external: ['electron'],
                    output: {
                      // .cjs extension tells Node.js this is CommonJS even when
                      // package.json has "type":"module", so require() works in the preload
                      entryFileNames: '[name].cjs',
                      format: 'cjs',
                    },
                  },
                },
              },
            },
          }),
        ]
      : []),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
