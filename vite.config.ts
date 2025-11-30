import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    // const env = loadEnv(mode, '.', ''); // No longer needed for client-side vars
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['icon.ico', 'apple-touch-icon.png'],
          manifest: {
            name: 'Quick Notes',
            short_name: 'QuickNotes',
            description: 'A simple and fast note-taking app.',
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
        }
      }
    };
});
