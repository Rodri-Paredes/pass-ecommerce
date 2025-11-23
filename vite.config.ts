import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Compresión Gzip
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240, // Solo archivos > 10KB
      deleteOriginFile: false,
    }),
    // Compresión Brotli (mejor que Gzip)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
      deleteOriginFile: false,
    }),
    // Visualizador de bundle
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Minificación con Terser (mejor que esbuild para producción)
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Eliminar console.log en producción
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'], // Eliminar funciones específicas
      },
    },
    // Code splitting manual para vendors
    rollupOptions: {
      output: {
        manualChunks: {
          // React y dependencias core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Animaciones (pesado)
          'motion-vendor': ['framer-motion'],
          // Supabase y utilidades
          'supabase-vendor': ['@supabase/supabase-js'],
          // Zustand (state)
          'state-vendor': ['zustand'],
        },
        // Nombres de chunks optimizados
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Aumentar límite de advertencia de chunks
    chunkSizeWarningLimit: 1000,
    // Source maps solo para errores críticos
    sourcemap: false,
    // Optimizar CSS
    cssCodeSplit: true,
    cssMinify: true,
    // Reportar tamaño comprimido
    reportCompressedSize: true,
  },
  // Preview optimizado
  preview: {
    port: 4173,
    strictPort: true,
  },
});
