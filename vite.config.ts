import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
      },
    }),
    tailwindcss(),
  ],
  server: {
    proxy: (() => {
      const defaultSeeds = [
        '173.212.203.145',
        '173.212.220.65',
        '161.97.97.41',
        '192.190.136.36',
        '192.190.136.37',
        '192.190.136.38',
        '192.190.136.28',
        '192.190.136.29',
        '207.244.255.1',
      ]
      const seedsEnv = process.env.VITE_PNODE_SEEDS
      const seeds = (seedsEnv ? seedsEnv.split(',') : defaultSeeds).map(s => s.trim()).filter(Boolean)
      const first = seeds[0] ?? '173.212.203.145'
      const base: Record<string, {
        target: string
        changeOrigin: boolean
        rewrite: (path: string) => string
      }> = {
        '/prpc': {
          target: `http://${first}:6000`,
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/prpc/, '/rpc')
        }
      }
      const extra = Object.fromEntries(seeds.map(ip => [
        `/pnode/${ip}`,
        {
          target: `http://${ip}:6000`,
          changeOrigin: true,
          rewrite: () => '/rpc'
        }
      ]))
      return { ...base, ...extra }
    })()
  },
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@features': path.resolve(__dirname, './src/features'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
})
