import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { version } from './package.json';

export default defineConfig(({ mode }) => {
    // const env = loadEnv(mode, '.', ''); // No longer needed for client-side vars
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      define: {
        'import.meta.env.APP_VERSION': JSON.stringify(version)
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['icon.ico', 'apple-touch-icon.png', 'apple-splash-*.png'],
          manifest: {
            name: 'Quick Notes',
            short_name: 'QuickNotes',
            description: 'A simple and fast custom note-taking app.',
            screenshots: [
              {
                "src": "screenshot1.png",
                "sizes": "1080x1920",
                "type": "image/png"
              }
            ],
            theme_color: '#667eea',
            background_color: '#667eea',
            display: 'standalone',
            scope: '/',
            start_url: '/',
            orientation: 'portrait',
            icons: [
              {
                src: 'pwa-72x72.png',
                sizes: '72x72',
                type: 'image/png'
              },
              {
                src: 'pwa-96x96.png',
                sizes: '96x96',
                type: 'image/png'
              },
              {
                src: 'pwa-144x144.png',
                sizes: '144x144',
                type: 'image/png'
              },
              {
                src: 'pwa-192x192.png', // Should be in public folder
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: 'pwa-512x512.png', // Should be in public folder
                sizes: '512x512',
                type: 'image/png'
              },
              {
                src: 'pwa-512x512.png', // Maskable icon
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable'
              }
            ]
          }
        })
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
          '@shared': path.resolve(__dirname, './src/shared'),
          '@features': path.resolve(__dirname, './src/features'),
          '@app': path.resolve(__dirname, './src/app'),
        }
      }
    };
});
