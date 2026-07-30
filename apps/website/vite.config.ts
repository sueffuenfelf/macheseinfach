import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { staticSeoPlugin } from './vite-plugin-static-seo';

export default defineConfig({
    envPrefix: ['VITE_', 'FF_'],
    plugins: [react(), tailwindcss(), staticSeoPlugin()],
    define: {
        'process.env': {},
    },
    optimizeDeps: {
        exclude: ['@xenova/transformers'],
        esbuildOptions: {
            define: {
                'process.env': '{}',
            },
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('@xenova/transformers')) return 'transformers';
                },
            },
        },
    },
    server: {
        allowedHosts: ['.kounds.local'],
        port: 5173,
    },
    preview: {
        allowedHosts: ['.macheseinfa.ch', '.kounds.local'],
    },
});
