import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor'
            }
            if (id.includes('@reduxjs') || id.includes('redux')) {
              return 'redux-vendor'
            }
            if (id.includes('@radix-ui')) {
              return 'ui-vendor'
            }
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
              return 'form-vendor'
            }
            if (id.includes('firebase')) {
              return 'firebase-vendor'
            }
            if (id.includes('socket.io')) {
              return 'socket-vendor'
            }
            if (id.includes('axios') || id.includes('clsx') || id.includes('class-variance-authority') || id.includes('tailwind-merge') || id.includes('lucide-react')) {
              return 'utils-vendor'
            }
            if (id.includes('embla-carousel')) {
              return 'carousel-vendor'
            }
            // Default vendor chunk for other node_modules
            return 'vendor'
          }

          // Feature chunks
          if (id.includes('/pages/')) {
            if (id.includes('LoginPage') || id.includes('RegisterPage')) {
              return 'auth'
            }
            if (id.includes('HomePage') || id.includes('ExplorePage') || id.includes('PostPage')) {
              return 'posts'
            }
            if (id.includes('ProfilePage') || id.includes('UserProfilePage')) {
              return 'profile'
            }
            if (id.includes('Messaging')) {
              return 'messaging'
            }
            if (id.includes('SettingsPage')) {
              return 'settings'
            }
            if (id.includes('NotificationsPage')) {
              return 'notifications'
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1MB
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
    ],
  },
})
